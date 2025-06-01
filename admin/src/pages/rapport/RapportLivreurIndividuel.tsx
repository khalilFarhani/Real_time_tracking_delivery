import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
  Divider,
  Badge,
  GlobalStyles,
  Tooltip as MuiTooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import axios from 'axios';
import { generateIndividualLivreurReportPDF } from '../../utils/pdfGenerator';

const API_URL = 'http://localhost:5283';

// Animations CSS pour les segments du graphique PieChart
const pieAnimationStyles = `
  @keyframes successPulse {
    0% { transform: scale(1.1); filter: drop-shadow(0 0 20px #05CD99) brightness(1.2); }
    100% { transform: scale(1.15); filter: drop-shadow(0 0 30px #05CD99) brightness(1.4); }
  }

  @keyframes transitFlow {
    0% { transform: scale(1.1) translateY(0px); filter: drop-shadow(0 0 25px #4318FF) brightness(1.3); }
    25% { transform: scale(1.12) translateY(-3px); filter: drop-shadow(0 0 30px #4318FF) brightness(1.4); }
    50% { transform: scale(1.15) translateY(0px); filter: drop-shadow(0 0 35px #4318FF) brightness(1.5); }
    75% { transform: scale(1.12) translateY(3px); filter: drop-shadow(0 0 30px #4318FF) brightness(1.4); }
    100% { transform: scale(1.1) translateY(0px); filter: drop-shadow(0 0 25px #4318FF) brightness(1.3); }
  }

  @keyframes preparationWave {
    0% { transform: scale(1.1) translateX(0px); filter: drop-shadow(0 0 18px #FFCE20) brightness(1.15); }
    50% { transform: scale(1.12) translateX(3px); filter: drop-shadow(0 0 25px #FFCE20) brightness(1.3); }
    100% { transform: scale(1.1) translateX(0px); filter: drop-shadow(0 0 18px #FFCE20) brightness(1.15); }
  }

  @keyframes errorShake {
    0% { transform: scale(1.1) translateX(0px); filter: drop-shadow(0 0 15px #EE5D50) brightness(1.1); }
    25% { transform: scale(1.12) translateX(-2px); filter: drop-shadow(0 0 20px #EE5D50) brightness(1.2); }
    75% { transform: scale(1.12) translateX(2px); filter: drop-shadow(0 0 20px #EE5D50) brightness(1.2); }
    100% { transform: scale(1.1) translateX(0px); filter: drop-shadow(0 0 15px #EE5D50) brightness(1.1); }
  }

  @keyframes defaultGlow {
    0% { transform: scale(1.1); filter: drop-shadow(0 0 12px #707EAE) brightness(1.1); }
    100% { transform: scale(1.13); filter: drop-shadow(0 0 18px #707EAE) brightness(1.25); }
  }

  @keyframes shimmer {
    0% { background-position: -300% 0; }
    100% { background-position: 300% 0; }
  }
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = pieAnimationStyles;
  document.head.appendChild(styleSheet);
}

// Styled components avec design moderne - aligné sur le rapport global
const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '28px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 25px rgba(102, 126, 234, 0.06)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '28px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 40px 80px rgba(67, 24, 255, 0.15), 0 15px 35px rgba(4, 190, 254, 0.1)',
    border: '2px solid rgba(67, 24, 255, 0.2)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.05), rgba(4, 190, 254, 0.05))',
    },
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 30%, #6946ff 60%, #9333ea 100%)',
  color: 'white',
  marginBottom: theme.spacing(4),
  borderRadius: '32px',
  boxShadow:
    '0 30px 80px rgba(67, 24, 255, 0.4), 0 15px 40px rgba(4, 190, 254, 0.3), 0 5px 15px rgba(147, 51, 234, 0.2)',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255,255,255,0.2)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 30%, rgba(255,255,255,0.08) 60%, transparent 100%)',
    pointerEvents: 'none',
    opacity: 0.8,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent)',
    animation: 'rotate 20s linear infinite',
    pointerEvents: 'none',
  },
  '@keyframes rotate': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow:
      '0 40px 100px rgba(67, 24, 255, 0.5), 0 20px 50px rgba(4, 190, 254, 0.4), 0 8px 20px rgba(147, 51, 234, 0.3)',
    border: '2px solid rgba(255,255,255,0.3)',
  },
}));

const MetricCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '32px',
  background: `
    linear-gradient(145deg,
      rgba(255, 255, 255, 0.98),
      rgba(248, 250, 252, 0.95)
    )`,
  backdropFilter: 'blur(40px)',
  transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `
    0 15px 50px rgba(0, 0, 0, 0.08),
    0 5px 15px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9)
  `,
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '220px',
  border: '2px solid rgba(255, 255, 255, 0.6)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(135deg,
        rgba(67, 24, 255, 0.05),
        rgba(4, 190, 254, 0.05)
      )`,
    borderRadius: '32px',
    zIndex: -2,
    opacity: 0,
    transition: 'opacity 0.8s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `
      conic-gradient(from 0deg,
        transparent,
        rgba(67, 24, 255, 0.08),
        transparent,
        rgba(4, 190, 254, 0.08),
        transparent
      )`,
    animation: 'rotate 15s linear infinite',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.8s ease',
  },
  '&:hover': {
    transform: 'translateY(-15px) scale(1.05)',
    border: '2px solid rgba(67, 24, 255, 0.3)',
    boxShadow: `
      0 35px 100px rgba(67, 24, 255, 0.25),
      0 15px 40px rgba(4, 190, 254, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 1)
    `,
    '&::before': {
      opacity: 1,
    },
    '&::after': {
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)<{ iconColor?: string }>(({ theme, iconColor }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6))',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-3px',
    borderRadius: '50%',
    background: iconColor
      ? `linear-gradient(135deg, ${iconColor}, ${iconColor}88, ${iconColor}66, ${iconColor}44)`
      : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.5s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '2px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow: iconColor
      ? `0 15px 45px ${iconColor}30, inset 0 2px 8px rgba(255, 255, 255, 0.9)`
      : '0 15px 45px rgba(102, 126, 234, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.9)',
    '&::before': {
      opacity: 1,
    },
  },
}));

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

interface LivreurDashboardData {
  livreurInfo: {
    id: number;
    nom: string;
    email: string;
    telephone: string;
    imagePath?: string;
  };
  statistiquesPrincipales: {
    commandesTotales: number;
    commandesLivrees: number;
    commandesEnCours: number;
    revenus: number;
    tauxLivraison: number;
    revenuMoyen: number;
  };
  tempsLivraison: {
    tempsMoyenHeures: number;
    tempsMinHeures: number;
    tempsMaxHeures: number;
    nombreCommandesAvecTemps: number;
  };
  repartitionStatuts: Array<{
    statut: string;
    nombre: number;
    pourcentage: number;
  }>;
  zonesLivraison: Array<{
    zone: string;
    nombreLivraisons: number;
    revenusZone: number;
  }>;
  revenusParJour: Array<{
    date: string;
    revenus: number;
    nombreCommandes: number;
  }>;
  commandesRecentes: Array<{
    id: number;
    dateCreation: string;
    montantTotale: number;
    statut: string;
    adresseLivraison: string;
  }>;
  periode: string;
}

// Styles CSS globaux pour les animations ultra-avancées
const globalStyles = (
  <GlobalStyles
    styles={{
      '@keyframes pulse': {
        '0%': {
          transform: 'scale(1)',
          boxShadow: '0 0 0 0 rgba(67, 24, 255, 0.4)',
        },
        '50%': {
          transform: 'scale(1.05)',
          boxShadow: '0 0 0 10px rgba(67, 24, 255, 0.1)',
        },
        '100%': {
          transform: 'scale(1)',
          boxShadow: '0 0 0 0 rgba(67, 24, 255, 0)',
        },
      },
      '@keyframes shimmer': {
        '0%': { left: '-100%' },
        '100%': { left: '100%' },
      },
      '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(30px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      '@keyframes bounceIn': {
        '0%': {
          opacity: 0,
          transform: 'scale(0.3)',
        },
        '50%': {
          opacity: 1,
          transform: 'scale(1.05)',
        },
        '70%': {
          transform: 'scale(0.9)',
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)',
        },
      },
      '@keyframes float': {
        '0%': {
          transform: 'translateY(0px)',
        },
        '50%': {
          transform: 'translateY(-10px)',
        },
        '100%': {
          transform: 'translateY(0px)',
        },
      },
      '@keyframes glow': {
        '0%': {
          boxShadow: '0 0 20px rgba(67, 24, 255, 0.3)',
        },
        '50%': {
          boxShadow: '0 0 40px rgba(4, 190, 254, 0.6), 0 0 60px rgba(67, 24, 255, 0.4)',
        },
        '100%': {
          boxShadow: '0 0 20px rgba(67, 24, 255, 0.3)',
        },
      },
      '@keyframes slideInLeft': {
        '0%': {
          opacity: 0,
          transform: 'translateX(-50px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
      '@keyframes slideInRight': {
        '0%': {
          opacity: 0,
          transform: 'translateX(50px)',
        },
        '100%': {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
      '@keyframes morphing': {
        '0%': {
          borderRadius: '20px',
        },
        '50%': {
          borderRadius: '50px',
        },
        '100%': {
          borderRadius: '20px',
        },
      },
      '@keyframes colorShift': {
        '0%': {
          background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 100%)',
        },
        '33%': {
          background: 'linear-gradient(135deg, #04BEFE 0%, #9333ea 100%)',
        },
        '66%': {
          background: 'linear-gradient(135deg, #9333ea 0%, #10b981 100%)',
        },
        '100%': {
          background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 100%)',
        },
      },
      '.chart-container': {
        animation: 'fadeInUp 0.8s ease-out',
      },
      '.metric-card': {
        animation: 'bounceIn 0.6s ease-out',
      },
      '.floating-element': {
        animation: 'float 3s ease-in-out infinite',
      },
      '.glow-effect': {
        animation: 'glow 2s ease-in-out infinite alternate',
      },
      '.slide-left': {
        animation: 'slideInLeft 0.8s ease-out',
      },
      '.slide-right': {
        animation: 'slideInRight 0.8s ease-out',
      },
      '.morphing-shape': {
        animation: 'morphing 4s ease-in-out infinite',
      },
      '.color-shift': {
        animation: 'colorShift 6s ease-in-out infinite',
      },
    }}
  />
);

const RapportLivreurIndividuel = () => {
  const { livreurId } = useParams<{ livreurId: string }>();
  const navigate = useNavigate();
  const [periode, setPeriode] = useState<Periode>('mois');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LivreurDashboardData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePeriodeChange = (event: SelectChangeEvent<Periode>) => {
    setPeriode(event.target.value as Periode);
  };

  const handleRetour = () => {
    navigate('/app/rapport');
  };

  const fetchLivreurDashboard = async (selectedPeriode: Periode) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('🔍 Chargement du dashboard pour le livreur:', livreurId);
      console.log('📅 Période sélectionnée:', selectedPeriode);

      const response = await axios.get(
        `${API_URL}/api/rapport/livreur-dashboard/${livreurId}?periode=${selectedPeriode}`,
        { headers },
      );

      console.log('✅ Données dashboard reçues:', response.data);
      console.log('📊 Répartition des statuts reçue:', response.data.repartitionStatuts);
      console.log('🎯 Livreur ID:', livreurId, 'Période:', selectedPeriode);
      setData(response.data);
    } catch (err) {
      console.error('❌ Erreur lors du chargement du dashboard:', err);
      setError('Erreur lors du chargement du dashboard du livreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (livreurId) {
      fetchLivreurDashboard(periode);
    }
  }, [periode, livreurId]);

  const getPeriodeLabel = (periode: Periode) => {
    switch (periode) {
      case 'jour':
        return "Aujourd'hui";
      case 'semaine':
        return 'Cette semaine';
      case 'mois':
        return 'Ce mois';
      case 'annee':
        return 'Cette année';
      default:
        return 'Période';
    }
  };

  const getStatutColor = (statut: string) => {
    const statutLower = statut.toLowerCase();
    switch (statutLower) {
      case 'livré':
      case 'livre':
        return '#05CD99'; // Success green
      case 'en transit':
        return '#4318FF'; // Primary purple
      case 'en préparation':
      case 'en preparation':
        return '#FFCE20'; // Warning yellow
      case 'confirmé':
      case 'confirme':
      case 'confirmée':
      case 'confirmee':
        return '#04BEFE'; // Secondary sky blue
      case 'annulé':
      case 'annule':
      case 'annulée':
      case 'annulee':
        return '#EE5D50'; // Error red
      case 'en attente':
        return '#FFB547'; // Warning light
      default:
        return '#707EAE'; // Gray from theme
    }
  };

  const getStatutEmoji = (statut: string) => {
    const statutLower = statut.toLowerCase();
    switch (statutLower) {
      case 'livré':
      case 'livre':
      case 'livree':
        return '✅';
      case 'en transit':
        return '🚚';
      case 'en préparation':
      case 'en preparation':
        return '📦';
      case 'confirmé':
      case 'confirme':
      case 'confirmée':
      case 'confirmee':
        return '✔️';
      case 'annulé':
      case 'annule':
      case 'annulée':
      case 'annulee':
        return '❌';
      case 'en attente':
        return '⏳';
      default:
        return '❓';
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current || !data || !periode) return;

    try {
      setIsGeneratingPDF(true);
      await generateIndividualLivreurReportPDF(
        reportRef,
        data.livreurInfo.nom,
        periode,
        getPeriodeLabel,
      );
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Chargement du rapport...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucune donnée disponible pour ce livreur.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {globalStyles}
      <Box
        ref={reportRef}
        sx={{
          minHeight: '100vh',
          background: `
            linear-gradient(135deg,
              rgba(248, 250, 252, 0.95) 0%,
              rgba(226, 232, 240, 0.9) 20%,
              rgba(241, 245, 249, 0.95) 40%,
              rgba(255, 255, 255, 0.98) 60%,
              rgba(248, 250, 252, 0.95) 80%,
              rgba(226, 232, 240, 0.9) 100%
            )`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 15% 85%, rgba(67, 24, 255, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 85% 15%, rgba(4, 190, 254, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 45% 45%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.04) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
            zIndex: -2,
            animation: 'float 8s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'fixed',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: `
              conic-gradient(from 0deg at 50% 50%,
                transparent 0deg,
                rgba(67, 24, 255, 0.02) 60deg,
                transparent 120deg,
                rgba(4, 190, 254, 0.02) 180deg,
                transparent 240deg,
                rgba(147, 51, 234, 0.02) 300deg,
                transparent 360deg
              )
            `,
            pointerEvents: 'none',
            zIndex: -1,
            animation: 'rotate 60s linear infinite',
          },
          p: 3,
        }}
      >
        {/* En-tête avec informations du livreur */}
        <HeaderCard>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  onClick={handleRetour}
                  sx={{
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                    color: '#4318FF',
                    borderRadius: '16px',
                    backdropFilter: 'blur(25px)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(67, 24, 255, 0.08)',
                    '&:hover': {
                      background:
                        'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                      border: '2px solid rgba(67, 24, 255, 0.3)',
                      transform: 'translateY(-4px) scale(1.05)',
                      boxShadow:
                        '0 20px 60px rgba(67, 24, 255, 0.2), 0 8px 25px rgba(4, 190, 254, 0.1)',
                    },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    📊 Rapport Livreur Spécifique
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                    {`Analyse détaillée des performances${periode ? ` - ${getPeriodeLabel(periode)}` : ''}`}
                  </Typography>
                </Box>
              </Box>

              {/* Bouton de téléchargement et sélecteur de période */}
              <Box display="flex" alignItems="center" gap={2}>
                <MuiTooltip
                  title={isGeneratingPDF ? 'Génération en cours...' : 'Télécharger le rapport PDF'}
                  arrow
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                      borderRadius: '8px',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(67, 24, 255, 0.3)',
                      opacity: isGeneratingPDF ? 0.7 : 1,
                      '&:hover': {
                        transform: isGeneratingPDF ? 'none' : 'translateY(-2px)',
                        boxShadow: isGeneratingPDF
                          ? '0 2px 10px rgba(67, 24, 255, 0.3)'
                          : '0 6px 20px rgba(67, 24, 255, 0.4)',
                      },
                    }}
                    onClick={isGeneratingPDF ? undefined : generatePDF}
                    className="download-button"
                  >
                    {isGeneratingPDF ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      <DownloadIcon sx={{ color: 'white', fontSize: '24px' }} />
                    )}
                  </Box>
                </MuiTooltip>
                {/* Sélecteur de période - visible uniquement sur grands écrans */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <FormControl
                    variant="outlined"
                    sx={{
                      minWidth: 180,
                      '& .MuiOutlinedInput-root': {
                        background:
                          'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                        borderRadius: '20px',
                        backdropFilter: 'blur(25px)',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        minHeight: '42px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(4, 190, 254, 0.08)',
                        '&:hover': {
                          background:
                            'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                          border: '2px solid rgba(4, 190, 254, 0.3)',
                          transform: 'translateY(-6px) scale(1.02)',
                          boxShadow:
                            '0 20px 60px rgba(4, 190, 254, 0.2), 0 8px 25px rgba(67, 24, 255, 0.1)',
                        },
                      },
                    }}
                  >
                    <Select
                      value={periode}
                      onChange={handlePeriodeChange}
                      displayEmpty
                      IconComponent={ExpandMoreIcon}
                      renderValue={(selected) => {
                        // Afficher le texte complet au lieu de juste l'icône
                        const options = {
                          jour: "🌅 Aujourd'hui",
                          semaine: '📅 Cette semaine',
                          mois: '📊 Ce mois',
                          annee: '🗓️ Cette année',
                        };
                        return (
                          <span style={{ color: '#4318FF', fontWeight: 500 }}>
                            {options[selected as keyof typeof options]}
                          </span>
                        );
                      }}
                      sx={{
                        color: '#4318FF',
                        fontWeight: 500,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSvgIcon-root': {
                          color: '#4318FF',
                          filter: 'drop-shadow(0 1px 2px rgba(67, 24, 255, 0.2))',
                        },
                      }}
                    >
                      <MenuItem value="jour">🌅 Aujourd'hui</MenuItem>
                      <MenuItem value="semaine">📅 Cette semaine</MenuItem>
                      <MenuItem value="mois">📊 Ce mois</MenuItem>
                      <MenuItem value="annee">🗓️ Cette année</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Informations du livreur */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'flex-start', lg: 'center' }}
              gap={4}
              mt={3}
              position="relative"
            >
              {/* Sélecteur de période - visible uniquement sur petits écrans */}
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 110, md: 95 },
                  right: 0,
                  display: { xs: 'block', lg: 'none' },
                  zIndex: 2,
                }}
              >
                <FormControl
                  variant="outlined"
                  sx={{
                    minWidth: 180,
                    '& .MuiOutlinedInput-root': {
                      background:
                        'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                      borderRadius: '20px',
                      backdropFilter: 'blur(25px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                      minHeight: '42px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(4, 190, 254, 0.08)',
                      '&:hover': {
                        background:
                          'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                        border: '2px solid rgba(4, 190, 254, 0.3)',
                        transform: 'translateY(-6px) scale(1.02)',
                        boxShadow:
                          '0 20px 60px rgba(4, 190, 254, 0.2), 0 8px 25px rgba(67, 24, 255, 0.1)',
                      },
                    },
                  }}
                >
                  <Select
                    value={periode}
                    onChange={handlePeriodeChange}
                    displayEmpty
                    IconComponent={ExpandMoreIcon}
                    renderValue={(selected) => {
                      const options = {
                        jour: "🌅 Aujourd'hui",
                        semaine: '📅 Cette semaine',
                        mois: '📊 Ce mois',
                        annee: '🗓️ Cette année',
                      };
                      return (
                        <span style={{ color: '#4318FF', fontWeight: 500 }}>
                          {options[selected as keyof typeof options]}
                        </span>
                      );
                    }}
                    sx={{
                      color: '#4318FF',
                      fontWeight: 500,
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '& .MuiSvgIcon-root': {
                        color: '#4318FF',
                        filter: 'drop-shadow(0 1px 2px rgba(67, 24, 255, 0.2))',
                      },
                    }}
                  >
                    <MenuItem value="jour">🌅 Aujourd'hui</MenuItem>
                    <MenuItem value="semaine">📅 Cette semaine</MenuItem>
                    <MenuItem value="mois">📊 Ce mois</MenuItem>
                    <MenuItem value="annee">🗓️ Cette année</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Section Avatar et informations - Design amélioré */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexDirection: 'row', // Toujours horizontal
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  borderRadius: '24px',
                  padding: { xs: 2, md: 2.5 },
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.08), 0 6px 20px rgba(255,255,255,0.08)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  maxWidth: { xs: '100%', md: '500px' },
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12), 0 8px 25px rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.3)',
                  },
                }}
              >
                {/* Avatar avec badge de statut */}
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 24,
                        marginRight: { xs: 3, md: 4 },
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: '#10b981',
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    </Box>
                  }
                >
                  <Avatar
                    src={
                      data.livreurInfo.imagePath
                        ? `${API_URL}${data.livreurInfo.imagePath}`
                        : undefined
                    }
                    sx={{
                      width: { xs: 90, md: 110 },
                      height: { xs: 90, md: 110 },
                      marginRight: { xs: 2, md: 3 },
                      border: '4px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.15), 0 6px 15px rgba(255,255,255,0.2)',
                      background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 100%)',
                      fontSize: { xs: '36px', md: '44px' },
                      fontWeight: 'bold',
                      transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 8px 20px rgba(255,255,255,0.3)',
                      },
                    }}
                  >
                    {data.livreurInfo.nom ? data.livreurInfo.nom.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                </Badge>

                {/* Informations personnelles */}
                <Box
                  sx={{
                    textAlign: { xs: 'left', lg: 'center' }, // Gauche sur petits écrans, centré sur grands écrans
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: 'white',
                      mb: 1.5,
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      fontSize: { xs: '1.3rem', md: '1.6rem' },
                    }}
                  >
                    {data.livreurInfo.nom}
                  </Typography>

                  {/* Email avec design amélioré */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    mb={1}
                    justifyContent={{ xs: 'flex-start', lg: 'center' }}
                    sx={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <EmailIcon
                      fontSize="small"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                      }}
                    >
                      {data.livreurInfo.email}
                    </Typography>
                  </Box>

                  {/* Téléphone avec design amélioré */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                    justifyContent={{ xs: 'flex-start', lg: 'center' }}
                    sx={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <PhoneIcon
                      fontSize="small"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                      }}
                    >
                      {data.livreurInfo.telephone}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </HeaderCard>

        {/* Métriques principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard className="metric-card slide-left">
              <IconWrapper
                iconColor="#3b82f6"
                className="floating-element glow-effect"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                }}
              >
                <Box sx={{ color: '#3b82f6' }}>
                  <LocalShippingIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#3b82f6"
                gutterBottom
              >
                {data.statistiquesPrincipales.commandesTotales}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Commandes Totales
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📦 Total des commandes
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard className="metric-card slide-right">
              <IconWrapper
                iconColor="#10b981"
                className="floating-element glow-effect"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                  animationDelay: '0.2s',
                }}
              >
                <Box sx={{ color: '#10b981' }}>
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#10b981"
                gutterBottom
              >
                {data.statistiquesPrincipales.commandesLivrees}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Commandes Livrées
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Commandes terminées
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard className="metric-card slide-left">
              <IconWrapper
                iconColor="#f59e0b"
                className="floating-element glow-effect"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
                  animationDelay: '0.4s',
                }}
              >
                <Box sx={{ color: '#f59e0b' }}>
                  <PendingIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#f59e0b"
                gutterBottom
              >
                {data.statistiquesPrincipales.commandesEnCours}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                En Cours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⏳ Commandes en transit
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard className="metric-card slide-right">
              <IconWrapper
                iconColor="#8b5cf6"
                className="floating-element glow-effect"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1))',
                  animationDelay: '0.6s',
                }}
              >
                <Box sx={{ color: '#8b5cf6' }}>
                  <AttachMoneyIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#8b5cf6"
                gutterBottom
              >
                {data.statistiquesPrincipales.revenus.toFixed(2)} DT
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Revenus Totaux
              </Typography>
              <Typography variant="body2" color="text.secondary">
                💰 Revenus générés
              </Typography>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Nouvelles métriques avancées */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <IconWrapper
                iconColor="#06b6d4"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(8, 145, 178, 0.1))',
                }}
              >
                <Box sx={{ color: '#06b6d4' }}>
                  <AccessTimeIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#06b6d4"
                gutterBottom
              >
                {data.tempsLivraison.tempsMoyenHeures.toFixed(1)}h
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Temps Moyen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⏰ Durée moyenne de livraison
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <IconWrapper
                iconColor="#84cc16"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(132, 204, 22, 0.15), rgba(101, 163, 13, 0.1))',
                }}
              >
                <Box sx={{ color: '#84cc16' }}>
                  <SpeedIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#84cc16"
                gutterBottom
              >
                {data.statistiquesPrincipales.tauxLivraison.toFixed(1)}%
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Taux de Réussite
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🎯 Pourcentage de livraisons réussies
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <IconWrapper
                iconColor="#f97316"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.1))',
                }}
              >
                <Box sx={{ color: '#f97316' }}>
                  <LocationOnIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#f97316"
                gutterBottom
              >
                {data.zonesLivraison.length}
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Zones Actives
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🗺️ Zones de livraison couvertes
              </Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard>
              <IconWrapper
                iconColor="#ec4899"
                sx={{
                  background:
                    'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1))',
                }}
              >
                <Box sx={{ color: '#ec4899' }}>
                  <AttachMoneyIcon sx={{ fontSize: 32 }} />
                </Box>
              </IconWrapper>
              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color="#ec4899"
                gutterBottom
              >
                {data.statistiquesPrincipales.revenuMoyen.toFixed(0)} DT
              </Typography>
              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                Revenu Moyen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                💎 Revenu moyen par commande
              </Typography>
            </MetricCard>
          </Grid>
        </Grid>

        {/* Graphiques et données */}
        <Grid container spacing={3}>
          {/* Graphique des revenus - Design amélioré */}
          {data.revenusParJour && data.revenusParJour.length > 0 && (
            <Grid item xs={12} lg={8}>
              <StyledCard className="chart-container slide-left">
                <CardContent>
                  <Box sx={{ mb: 4 }}>
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '20px',
                          background:
                            'linear-gradient(135deg, #4318FF 0%, #04BEFE 50%, #9333ea 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow:
                            '0 12px 40px rgba(67, 24, 255, 0.4), 0 4px 16px rgba(4, 190, 254, 0.2)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background:
                              'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
                            animation: 'rotate 4s linear infinite',
                            pointerEvents: 'none',
                          },
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow:
                              '0 20px 60px rgba(67, 24, 255, 0.5), 0 8px 24px rgba(4, 190, 254, 0.3)',
                          },
                          '@keyframes rotate': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            color: 'white',
                            zIndex: 1,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          }}
                        >
                          📈
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h4"
                          fontWeight="bold"
                          sx={{
                            background:
                              'linear-gradient(135deg, #4318FF 0%, #04BEFE 50%, #9333ea 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                            textShadow: '0 2px 4px rgba(67, 24, 255, 0.1)',
                            letterSpacing: '-0.5px',
                          }}
                        >
                          Évolution des Revenus
                        </Typography>
                      </Box>

                      {/* Indicateur de période */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background:
                            'linear-gradient(135deg, rgba(67, 24, 255, 0.1), rgba(4, 190, 254, 0.05))',
                          borderRadius: '16px',
                          padding: '8px 16px',
                          border: '1px solid rgba(67, 24, 255, 0.2)',
                        }}
                      >
                        <Typography variant="h6" sx={{ color: '#4318FF' }}>
                          📅
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="#4318FF">
                          {getPeriodeLabel(periode)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Statistiques rapides améliorées */}
                    <Box
                      display="flex"
                      gap={2}
                      sx={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.6))',
                        borderRadius: '24px',
                        p: 3,
                        border: '2px solid rgba(67, 24, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        boxShadow:
                          '0 8px 32px rgba(67, 24, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(90deg, transparent, rgba(67, 24, 255, 0.1), transparent)',
                          animation: 'shimmer 3s infinite',
                        },
                        '@keyframes shimmer': {
                          '0%': { left: '-100%' },
                          '100%': { left: '100%' },
                        },
                      }}
                    >
                      {/* Total Période */}
                      <Box
                        textAlign="center"
                        sx={{
                          flex: 1,
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #4318FF, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            boxShadow: '0 8px 24px rgba(67, 24, 255, 0.3)',
                            animation: 'pulse 2s infinite',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            💰
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            background: 'linear-gradient(135deg, #4318FF, #6366f1)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5,
                          }}
                        >
                          {data.revenusParJour
                            .reduce((sum, item) => sum + item.revenus, 0)
                            .toFixed(2)}{' '}
                          DT
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          💎 Total Période
                        </Typography>
                      </Box>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          borderColor: 'rgba(67, 24, 255, 0.2)',
                          borderWidth: '1px',
                        }}
                      />

                      {/* Moyenne par jour */}
                      <Box
                        textAlign="center"
                        sx={{
                          flex: 1,
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #04BEFE, #0ea5e9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            boxShadow: '0 8px 24px rgba(4, 190, 254, 0.3)',
                            animation: 'pulse 2s infinite 0.5s',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            📊
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            background: 'linear-gradient(135deg, #04BEFE, #0ea5e9)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5,
                          }}
                        >
                          {(
                            data.revenusParJour.reduce((sum, item) => sum + item.revenus, 0) /
                            data.revenusParJour.length
                          ).toFixed(2)}{' '}
                          DT
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          📈 Moyenne/Jour
                        </Typography>
                      </Box>

                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                          borderColor: 'rgba(4, 190, 254, 0.2)',
                          borderWidth: '1px',
                        }}
                      />

                      {/* Pic Maximum */}
                      <Box
                        textAlign="center"
                        sx={{
                          flex: 1,
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                            animation: 'pulse 2s infinite 1s',
                          }}
                        >
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            🚀
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          sx={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5,
                          }}
                        >
                          {Math.max(...data.revenusParJour.map((item) => item.revenus)).toFixed(2)}{' '}
                          DT
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          ⭐ Pic Maximum
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '20px',
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.7))',
                      p: 2,
                      border: '1px solid rgba(67, 24, 255, 0.1)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 16px rgba(67, 24, 255, 0.05)',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          'radial-gradient(circle at 30% 20%, rgba(67, 24, 255, 0.05), transparent 50%), radial-gradient(circle at 70% 80%, rgba(4, 190, 254, 0.05), transparent 50%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={data.revenusParJour}
                        margin={{ top: 30, right: 40, left: 20, bottom: 30 }}
                      >
                        <defs>
                          <linearGradient id="revenusGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4318FF" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#04BEFE" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#9333ea" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4318FF" />
                            <stop offset="50%" stopColor="#04BEFE" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="shadow">
                            <feDropShadow
                              dx="0"
                              dy="4"
                              stdDeviation="8"
                              floodColor="#4318FF"
                              floodOpacity="0.3"
                            />
                          </filter>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="2 4"
                          stroke="rgba(67, 24, 255, 0.15)"
                          strokeWidth={1}
                          opacity={0.6}
                        />

                        <XAxis
                          dataKey="date"
                          stroke="#4318FF"
                          fontSize={13}
                          fontWeight="600"
                          tick={{ fill: '#4318FF', fontSize: 12 }}
                          axisLine={{ stroke: '#4318FF', strokeWidth: 2 }}
                          tickLine={{ stroke: '#4318FF', strokeWidth: 2 }}
                        />

                        <YAxis
                          stroke="#4318FF"
                          fontSize={13}
                          fontWeight="600"
                          tick={{ fill: '#4318FF', fontSize: 12 }}
                          axisLine={{ stroke: '#4318FF', strokeWidth: 2 }}
                          tickLine={{ stroke: '#4318FF', strokeWidth: 2 }}
                          label={{
                            value: 'Revenus (DT)',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fill: '#4318FF', fontWeight: 'bold' },
                          }}
                        />

                        <RechartsTooltip
                          contentStyle={{
                            background:
                              'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                            border: '2px solid rgba(67, 24, 255, 0.3)',
                            borderRadius: '20px',
                            boxShadow:
                              '0 25px 50px rgba(67, 24, 255, 0.2), 0 10px 30px rgba(4, 190, 254, 0.1)',
                            backdropFilter: 'blur(25px)',
                            padding: '16px',
                            fontSize: '14px',
                          }}
                          labelStyle={{
                            color: '#4318FF',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            fontSize: '16px',
                          }}
                          formatter={(value: number, name: string) => [
                            <span
                              style={{
                                color: name === 'revenus' ? '#4318FF' : '#04BEFE',
                                fontWeight: 'bold',
                                fontSize: '15px',
                              }}
                            >
                              {name === 'revenus' ? `${value.toFixed(2)} DT` : value}
                            </span>,
                            <span style={{ color: '#666', fontWeight: '600' }}>
                              {name === 'revenus' ? '💰 Revenus' : '📦 Commandes'}
                            </span>,
                          ]}
                          cursor={{
                            stroke: '#4318FF',
                            strokeWidth: 2,
                            strokeDasharray: '5 5',
                            strokeOpacity: 0.7,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenus"
                          stroke="url(#strokeGradient)"
                          strokeWidth={5}
                          dot={false}
                          activeDot={{
                            r: 16,
                            fill: '#04BEFE',
                            stroke: '#ffffff',
                            strokeWidth: 6,
                            filter: 'url(#glow)',
                            style: {
                              animation: 'pulse 1.5s infinite',
                            },
                          }}
                          fill="url(#revenusGradient)"
                          fillOpacity={0.3}
                          filter="url(#glow)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          {/* Statistiques de performance - Design Ultra-Moderne */}
          <Grid item xs={12} lg={4}>
            <StyledCard
              className="chart-container slide-right"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                background: `
                  linear-gradient(145deg,
                    rgba(255, 255, 255, 0.98),
                    rgba(248, 250, 252, 0.95)
                  )`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 20%, rgba(67, 24, 255, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(4, 190, 254, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)
                  `,
                  pointerEvents: 'none',
                  zIndex: -1,
                  animation: 'float 6s ease-in-out infinite',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `
                    conic-gradient(from 0deg,
                      transparent,
                      rgba(67, 24, 255, 0.03),
                      transparent,
                      rgba(4, 190, 254, 0.03),
                      transparent
                    )`,
                  animation: 'rotate 25s linear infinite',
                  pointerEvents: 'none',
                  zIndex: -1,
                },
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                {/* En-tête avec icône animée */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={3}
                  mb={4}
                  sx={{
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background:
                        'linear-gradient(90deg, transparent, rgba(67, 24, 255, 0.3), transparent)',
                      borderRadius: '1px',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '20px',
                      background: `
                        linear-gradient(135deg,
                          #4318FF 0%,
                          #04BEFE 50%,
                          #9333ea 100%
                        )`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `
                        0 15px 45px rgba(67, 24, 255, 0.4),
                        0 5px 15px rgba(4, 190, 254, 0.2)
                      `,
                      position: 'relative',
                      overflow: 'hidden',
                      animation: 'pulse 3s ease-in-out infinite',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: `
                          conic-gradient(from 0deg,
                            transparent,
                            rgba(255,255,255,0.3),
                            transparent
                          )`,
                        animation: 'rotate 4s linear infinite',
                        pointerEvents: 'none',
                      },
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                        boxShadow: `
                          0 25px 60px rgba(67, 24, 255, 0.5),
                          0 10px 25px rgba(4, 190, 254, 0.3)
                        `,
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        zIndex: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        animation: 'float 2s ease-in-out infinite',
                      }}
                    >
                      🎯
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{
                        background: `
                          linear-gradient(135deg,
                            #4318FF 0%,
                            #04BEFE 50%,
                            #9333ea 100%
                          )`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                        textShadow: '0 2px 4px rgba(67, 24, 255, 0.1)',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Métriques de livraison
                    </Typography>
                  </Box>
                </Box>

                {/* Taux de Livraison avec design spectaculaire */}
                <Box
                  sx={{
                    mb: 4,
                    position: 'relative',
                    background: `
                      linear-gradient(135deg,
                        rgba(255,255,255,0.9),
                        rgba(248,250,252,0.7)
                      )`,
                    borderRadius: '20px',
                    p: 3,
                    border: '2px solid rgba(67, 24, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `
                      0 8px 32px rgba(67, 24, 255, 0.1),
                      inset 0 1px 0 rgba(255,255,255,0.8)
                    `,
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `
                        linear-gradient(90deg,
                          transparent,
                          rgba(67, 24, 255, 0.1),
                          transparent
                        )`,
                      animation: 'shimmer 3s infinite',
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Taux de Livraison
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 4px rgba(67, 24, 255, 0.2)',
                      }}
                    >
                      {data.statistiquesPrincipales.tauxLivraison.toFixed(1)}%
                    </Typography>
                  </Box>

                  {/* Barre de progression ultra-moderne */}
                  <Box
                    sx={{
                      height: '12px',
                      borderRadius: '6px',
                      background: 'rgba(67, 24, 255, 0.1)',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 4px rgba(67, 24, 255, 0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${data.statistiquesPrincipales.tauxLivraison}%`,
                        background: `
                          linear-gradient(135deg,
                            #4318FF 0%,
                            #04BEFE 50%,
                            #9333ea 100%
                          )`,
                        borderRadius: '6px',
                        position: 'relative',
                        animation: 'progressFill 2s ease-out',
                        boxShadow: '0 2px 8px rgba(67, 24, 255, 0.3)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `
                            linear-gradient(90deg,
                              transparent,
                              rgba(255,255,255,0.6),
                              transparent
                            )`,
                          animation: 'shimmer 2s ease-in-out infinite',
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Divider avec effet lumineux */}
                <Box
                  sx={{
                    height: '2px',
                    background: `
                      linear-gradient(90deg,
                        transparent,
                        rgba(67, 24, 255, 0.3),
                        rgba(4, 190, 254, 0.3),
                        transparent
                      )`,
                    borderRadius: '1px',
                    my: 3,
                    animation: 'glow 2s ease-in-out infinite alternate',
                  }}
                />

                {/* Revenu Moyen avec design premium */}
                <Box
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                    background: `
                      linear-gradient(135deg,
                        rgba(4, 190, 254, 0.05),
                        rgba(147, 51, 234, 0.05)
                      )`,
                    borderRadius: '16px',
                    p: 3,
                    border: '1px solid rgba(4, 190, 254, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 15px 35px rgba(4, 190, 254, 0.2)',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={1}
                    sx={{ fontWeight: 600 }}
                  >
                    💰 Revenu Moyen par Commande
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                      background: `
                        linear-gradient(135deg,
                          #04BEFE 0%,
                          #9333ea 100%
                        )`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 8px rgba(4, 190, 254, 0.2)',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #04BEFE, transparent)',
                        borderRadius: '2px',
                        animation: 'glow 2s ease-in-out infinite alternate',
                      },
                    }}
                  >
                    {data.statistiquesPrincipales.revenuMoyen.toFixed(2)} DT
                  </Typography>
                </Box>

                {/* Divider avec effet lumineux */}
                <Box
                  sx={{
                    height: '2px',
                    background: `
                      linear-gradient(90deg,
                        transparent,
                        rgba(67, 24, 255, 0.3),
                        rgba(4, 190, 254, 0.3),
                        transparent
                      )`,
                    borderRadius: '1px',
                    my: 3,
                    animation: 'glow 2s ease-in-out infinite alternate',
                  }}
                />

                {/* Zones et Nombres avec design premium */}
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      flex: 1,
                      background: `
                        linear-gradient(135deg,
                          rgba(249, 115, 22, 0.05),
                          rgba(234, 88, 12, 0.05)
                        )`,
                      borderRadius: '16px',
                      p: 2.5,
                      border: '1px solid rgba(249, 115, 22, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 35px rgba(249, 115, 22, 0.2)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={1}
                      sx={{ fontWeight: 600 }}
                    >
                      🗺️ Zones Couvertes
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background: `
                          linear-gradient(135deg,
                            #f97316 0%,
                            #ea580c 100%
                          )`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 8px rgba(249, 115, 22, 0.2)',
                      }}
                    >
                      {data.zonesLivraison.length}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: 'center',
                      flex: 1,
                      background: `
                        linear-gradient(135deg,
                          rgba(16, 185, 129, 0.05),
                          rgba(5, 150, 105, 0.05)
                        )`,
                      borderRadius: '16px',
                      p: 2.5,
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 35px rgba(16, 185, 129, 0.2)',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={1}
                      sx={{ fontWeight: 600 }}
                    >
                      📦 Total Commandes
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        background: `
                          linear-gradient(135deg,
                            #10b981 0%,
                            #059669 100%
                          )`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 8px rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      {data.statistiquesPrincipales.commandesTotales}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Répartition des statuts - Style identique au Rapport des Livreurs */}
          {data.repartitionStatuts && data.repartitionStatuts.length > 0 && (
            <Grid item xs={12} lg={6}>
              <StyledCard>
                <CardContent>
                  {/* En-tête avec style du Rapport des Livreurs */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={3}
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(67, 24, 255, 0.05), rgba(4, 190, 254, 0.05))',
                      borderRadius: '16px',
                      p: 2,
                      border: '2px solid rgba(67, 24, 255, 0.1)',
                      transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.02) translateY(-2px)',
                        boxShadow: '0 12px 35px rgba(67, 24, 255, 0.15)',
                        border: '2px solid rgba(67, 24, 255, 0.2)',
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                          borderRadius: '12px',
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 25px rgba(67, 24, 255, 0.3)',
                          transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 15px 40px rgba(67, 24, 255, 0.4)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '20px' }}>📊</Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.05) translateY(-2px)',
                          },
                        }}
                      >
                        Répartition des Statuts
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                        borderRadius: '20px',
                        px: 2,
                        py: 1,
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(67, 24, 255, 0.3)',
                        transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.1) translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(67, 24, 255, 0.4)',
                        },
                      }}
                    >
                      {getPeriodeLabel(periode)}
                    </Box>
                  </Box>

                  {/* Statistique principale moderne - Style Rapport des Livreurs */}
                  <Box
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.8))',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '24px',
                      p: 4,
                      mb: 4,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #05CD99, #FFCE20, #EE5D50, #4318FF)',
                        backgroundSize: '300% 100%',
                        animation: 'shimmer 8s infinite',
                        opacity: 0.8,
                      },
                      '&:hover': {
                        transform: 'scale(1.02) translateY(-5px)',
                        boxShadow: '0 25px 60px rgba(67, 24, 255, 0.15)',
                        border: '2px solid rgba(67, 24, 255, 0.2)',
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb={2}
                      sx={{
                        transition: 'all 2.2s cubic-bezier(0.23, 1, 0.32, 1)',
                        '&:hover': {
                          transform: 'scale(1.25) rotateY(25deg) translateY(-12px) rotateX(8deg)',
                          filter: 'drop-shadow(0 20px 60px rgba(67, 24, 255, 0.4))',
                        },
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 4px 8px rgba(67, 24, 255, 0.3)',
                          animation: 'pulse 3s ease-in-out infinite',
                        }}
                      >
                        {data.repartitionStatuts.reduce((sum, item) => sum + item.nombre, 0)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        '&:hover': {
                          transform: 'scale(1.05) translateY(-3px)',
                          color: '#4318FF',
                        },
                      }}
                    >
                      Total des commandes du livreur
                    </Typography>

                    {/* Statut dominant */}
                    {data.repartitionStatuts.length > 0 && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          background: `linear-gradient(135deg, ${getStatutColor(data.repartitionStatuts[0].statut)}20, ${getStatutColor(data.repartitionStatuts[0].statut)}10)`,
                          border: `2px solid ${getStatutColor(data.repartitionStatuts[0].statut)}40`,
                          transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          '&:hover': {
                            transform: 'scale(1.1) translateY(-5px)',
                            background: `linear-gradient(135deg, ${getStatutColor(data.repartitionStatuts[0].statut)}30, ${getStatutColor(data.repartitionStatuts[0].statut)}20)`,
                            border: `3px solid ${getStatutColor(data.repartitionStatuts[0].statut)}60`,
                            boxShadow: `0 12px 35px ${getStatutColor(data.repartitionStatuts[0].statut)}40`,
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: getStatutColor(data.repartitionStatuts[0].statut),
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          Status disponible : {data.repartitionStatuts.length} status
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Graphique avec style du Rapport des Livreurs */}
                  <Box
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.8))',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '24px',
                      p: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.01) translateY(-2px)',
                        boxShadow: '0 20px 50px rgba(67, 24, 255, 0.1)',
                        border: '2px solid rgba(67, 24, 255, 0.15)',
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        {/* Gradients SVG identiques au Rapport des Livreurs */}
                        <defs>
                          <linearGradient id="gradient-livre" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#05CD99" />
                            <stop offset="100%" stopColor="#00A86B" />
                          </linearGradient>
                          <linearGradient
                            id="gradient-en-transit"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#4318FF" />
                            <stop offset="100%" stopColor="#04BEFE" />
                          </linearGradient>
                          <linearGradient
                            id="gradient-en-preparation"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#FFCE20" />
                            <stop offset="100%" stopColor="#FF9500" />
                          </linearGradient>
                          <linearGradient id="gradient-annule" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#EE5D50" />
                            <stop offset="100%" stopColor="#C53030" />
                          </linearGradient>
                          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow
                              dx="0"
                              dy="4"
                              stdDeviation="8"
                              floodColor="rgba(0,0,0,0.15)"
                            />
                          </filter>
                        </defs>

                        <Pie
                          data={data.repartitionStatuts}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={120}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="nombre"
                          stroke="rgba(255, 255, 255, 0.9)"
                          strokeWidth={5}
                          filter="url(#shadow)"
                        >
                          {data.repartitionStatuts.map((entry, index) => {
                            // Mapping des statuts vers les gradients
                            const getGradientId = (statut: string) => {
                              const statutLower = statut.toLowerCase();
                              switch (statutLower) {
                                case 'livré':
                                case 'livre':
                                  return 'url(#gradient-livre)';
                                case 'en transit':
                                  return 'url(#gradient-en-transit)';
                                case 'en préparation':
                                case 'en preparation':
                                  return 'url(#gradient-en-preparation)';
                                case 'annulé':
                                case 'annule':
                                case 'annulée':
                                case 'annulee':
                                  return 'url(#gradient-annule)';
                                default:
                                  return getStatutColor(statut);
                              }
                            };

                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={getGradientId(entry.statut)}
                                style={{
                                  transformOrigin: 'center',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                  const element = e.target as HTMLElement;
                                  const statutLower = entry.statut.toLowerCase();

                                  // Animations spécifiques par statut
                                  switch (statutLower) {
                                    case 'livré':
                                    case 'livre':
                                      // Animation de succès - pulsation verte
                                      element.style.animation =
                                        'successPulse 0.6s ease-in-out infinite alternate';
                                      break;
                                    case 'en transit':
                                      // Animation de mouvement fluide - flow vertical
                                      element.style.animation =
                                        'transitFlow 1.2s ease-in-out infinite';
                                      break;
                                    case 'en préparation':
                                    case 'en preparation':
                                      // Animation de préparation - oscillation
                                      element.style.animation =
                                        'preparationWave 0.8s ease-in-out infinite';
                                      break;
                                    case 'annulé':
                                    case 'annule':
                                    case 'annulée':
                                    case 'annulee':
                                      // Animation d'erreur - shake
                                      element.style.animation =
                                        'errorShake 0.5s ease-in-out infinite';
                                      break;
                                    default:
                                      // Animation par défaut - glow simple
                                      element.style.animation =
                                        'defaultGlow 1s ease-in-out infinite alternate';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  // Réinitialiser les animations
                                  const element = e.target as HTMLElement;
                                  element.style.animation = '';
                                }}
                              />
                            );
                          })}
                        </Pie>

                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div
                                  style={{
                                    background: `
                                      linear-gradient(135deg,
                                        rgba(255,255,255,0.98),
                                        rgba(248,250,252,0.95)
                                      )`,
                                    border: '2px solid rgba(67, 24, 255, 0.3)',
                                    borderRadius: '16px',
                                    boxShadow: `
                                      0 20px 50px rgba(67, 24, 255, 0.2),
                                      0 8px 20px rgba(0,0,0,0.1)
                                    `,
                                    backdropFilter: 'blur(20px)',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                  }}
                                >
                                  <div
                                    style={{
                                      color: '#4318FF',
                                      fontWeight: 'bold',
                                      marginBottom: '4px',
                                      fontSize: '15px',
                                    }}
                                  >
                                    {data.statut}
                                  </div>
                                  <div style={{ color: '#374151' }}>
                                    📦 {data.nombre} commandes ({data.pourcentage}%)
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Legend
                          content={() => {
                            if (!data.repartitionStatuts || !data.repartitionStatuts.length)
                              return null;

                            return (
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  gap: '24px',
                                  paddingTop: '30px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                {data.repartitionStatuts.map((item, index) => {
                                  // Utiliser la même fonction de couleur que pour le graphique
                                  const color = getStatutColor(item.statut);

                                  return (
                                    <div
                                      key={index}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                                          borderRadius: '4px',
                                          boxShadow: `0 2px 8px ${color}33`,
                                        }}
                                      />
                                      <span
                                        style={{
                                          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                                          backgroundClip: 'text',
                                          WebkitBackgroundClip: 'text',
                                          WebkitTextFillColor: 'transparent',
                                          fontWeight: 'bold',
                                          fontSize: '14px',
                                          letterSpacing: '0.5px',
                                        }}
                                      >
                                        {item.statut}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          {/* Zones de livraison - Design Ultra-Premium */}
          {data.zonesLivraison && data.zonesLivraison.length > 0 && (
            <Grid item xs={12} lg={6}>
              <StyledCard
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.95),
                      rgba(248, 250, 252, 0.9),
                      rgba(249, 115, 22, 0.02)
                    )`,
                  backdropFilter: 'blur(25px)',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: `
                      linear-gradient(90deg,
                        #f97316 0%,
                        #ea580c 25%,
                        #fb923c 50%,
                        #f59e0b 75%,
                        #f97316 100%
                      )`,
                    backgroundSize: '400% 100%',
                    animation: 'shimmer 8s ease-in-out infinite',
                    opacity: 0.9,
                    zIndex: 1,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      linear-gradient(135deg,
                        rgba(249, 115, 22, 0.05) 0%,
                        transparent 50%,
                        rgba(234, 88, 12, 0.03) 100%
                      )`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `
                      0 25px 60px rgba(249, 115, 22, 0.25),
                      0 15px 35px rgba(0, 0, 0, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    '&::before': {
                      height: '6px',
                      opacity: 1,
                    },
                  },
                }}
              >
                <CardContent>
                  {/* En-tête avec style ultra-premium */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={4}
                    sx={{
                      position: 'relative',
                      background: `
                        linear-gradient(135deg,
                          rgba(249, 115, 22, 0.08) 0%,
                          rgba(234, 88, 12, 0.06) 50%,
                          rgba(251, 146, 60, 0.04) 100%
                        )`,
                      borderRadius: '20px',
                      p: 3,
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                      transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                          linear-gradient(135deg,
                            rgba(249, 115, 22, 0.1),
                            transparent,
                            rgba(234, 88, 12, 0.08)
                          )`,
                        borderRadius: '20px',
                        opacity: 0,
                        transition: 'opacity 2s ease',
                        zIndex: -1,
                      },
                      '&:hover': {
                        transform: 'scale(1.03) translateY(-4px)',
                        boxShadow: `
                          0 20px 50px rgba(249, 115, 22, 0.2),
                          0 10px 25px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        border: '2px solid rgba(249, 115, 22, 0.3)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box
                        sx={{
                          position: 'relative',
                          background: `
                            linear-gradient(135deg,
                              #f97316 0%,
                              #ea580c 50%,
                              #dc2626 100%
                            )`,
                          borderRadius: '20px',
                          p: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `
                            0 12px 30px rgba(249, 115, 22, 0.4),
                            0 6px 15px rgba(0, 0, 0, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                              linear-gradient(45deg,
                                rgba(255, 255, 255, 0.2),
                                transparent,
                                rgba(255, 255, 255, 0.1)
                              )`,
                            borderRadius: '20px',
                            opacity: 0,
                            transition: 'opacity 2s ease',
                          },
                          '&:hover': {
                            transform: 'scale(1.15) rotate(8deg) translateY(-2px)',
                            boxShadow: `
                              0 20px 50px rgba(249, 115, 22, 0.5),
                              0 10px 25px rgba(0, 0, 0, 0.15),
                              inset 0 2px 0 rgba(255, 255, 255, 0.4)
                            `,
                            '&::before': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '28px',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                            transition: 'all 2s ease',
                          }}
                        >
                          🗺️
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.05) translateY(-2px)',
                            },
                          }}
                        >
                          Top Zones de Livraison
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          Performance par zone géographique
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            #f97316 0%,
                            #ea580c 50%,
                            #dc2626 100%
                          )`,
                        borderRadius: '25px',
                        px: 3,
                        py: 1.5,
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: `
                          0 8px 20px rgba(249, 115, 22, 0.4),
                          0 4px 10px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `
                            linear-gradient(90deg,
                              transparent,
                              rgba(255, 255, 255, 0.3),
                              transparent
                            )`,
                          transition: 'left 2s ease',
                        },
                        '&:hover': {
                          transform: 'scale(1.15) translateY(-3px) rotate(-2deg)',
                          boxShadow: `
                            0 15px 35px rgba(249, 115, 22, 0.5),
                            0 8px 20px rgba(0, 0, 0, 0.15),
                            inset 0 2px 0 rgba(255, 255, 255, 0.4)
                          `,
                          '&::before': {
                            left: '100%',
                          },
                        },
                      }}
                    >
                      {data.zonesLivraison.length} Zone{data.zonesLivraison.length > 1 ? 's' : ''}
                    </Box>
                  </Box>

                  {/* Graphique avec design ultra-moderne */}
                  <Box
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.8))',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(249, 115, 22, 0.1)',
                      borderRadius: '20px',
                      p: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.01) translateY(-2px)',
                        boxShadow: '0 20px 50px rgba(249, 115, 22, 0.1)',
                        border: '2px solid rgba(249, 115, 22, 0.2)',
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={data.zonesLivraison}
                        margin={{ top: 30, right: 40, left: 20, bottom: 20 }}
                      >
                        <defs>
                          {/* Gradients améliorés avec plus de profondeur */}
                          <linearGradient id="livraisonsZoneGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#ea580c" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="revenusZoneGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4318FF" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#04BEFE" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#0284C7" stopOpacity={0.7} />
                          </linearGradient>
                          {/* Filtres pour les ombres */}
                          <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow
                              dx="0"
                              dy="4"
                              stdDeviation="6"
                              floodColor="rgba(249, 115, 22, 0.2)"
                            />
                          </filter>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="5 5"
                          stroke="rgba(249, 115, 22, 0.15)"
                          strokeWidth={1}
                        />

                        <XAxis
                          dataKey="zone"
                          stroke="#f97316"
                          fontSize={13}
                          fontWeight="600"
                          tick={{ fill: '#f97316' }}
                          axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                          tickLine={{ stroke: '#f97316', strokeWidth: 2 }}
                        />

                        <YAxis
                          stroke="#f97316"
                          fontSize={12}
                          fontWeight="500"
                          tick={{ fill: '#f97316' }}
                          axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
                          tickLine={{ stroke: '#f97316', strokeWidth: 2 }}
                        />

                        <RechartsTooltip
                          formatter={(value, name) => {
                            if (name === 'nombreLivraisons') {
                              return [`${value} livraisons`, '📦 Livraisons'];
                            } else if (name === 'revenusZone') {
                              return [`${value} DT`, '💰 Revenus'];
                            }
                            return [value, name];
                          }}
                          contentStyle={{
                            background: `
                              linear-gradient(135deg,
                                rgba(255,255,255,0.98),
                                rgba(248,250,252,0.95)
                              )`,
                            border: '2px solid rgba(249, 115, 22, 0.3)',
                            borderRadius: '16px',
                            boxShadow: `
                              0 20px 50px rgba(249, 115, 22, 0.2),
                              0 8px 20px rgba(0,0,0,0.1)
                            `,
                            backdropFilter: 'blur(20px)',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                          labelStyle={{
                            color: '#f97316',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                          }}
                        />

                        <Legend
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                          }}
                          iconType="rect"
                        />

                        <Bar
                          dataKey="nombreLivraisons"
                          fill="url(#livraisonsZoneGradient)"
                          name="📦 Livraisons"
                          radius={[6, 6, 0, 0]}
                          stroke="rgba(249, 115, 22, 0.8)"
                          strokeWidth={2}
                          filter="url(#barShadow)"
                        />

                        <Bar
                          dataKey="revenusZone"
                          fill="url(#revenusZoneGradient)"
                          name="💰 Revenus (DT)"
                          radius={[6, 6, 0, 0]}
                          stroke="rgba(67, 24, 255, 0.8)"
                          strokeWidth={2}
                          filter="url(#barShadow)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          {/* Analyse des temps de livraison - Design Ultra-Premium */}
          {data.tempsLivraison && data.tempsLivraison.nombreCommandesAvecTemps > 0 && (
            <Grid item xs={12} lg={12}>
              <StyledCard
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.95),
                      rgba(248, 250, 252, 0.9),
                      rgba(67, 24, 255, 0.02)
                    )`,
                  backdropFilter: 'blur(25px)',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: `
                      linear-gradient(90deg,
                        #4318FF 0%,
                        #04BEFE 25%,
                        #9333ea 50%,
                        #06b6d4 75%,
                        #4318FF 100%
                      )`,
                    backgroundSize: '400% 100%',
                    animation: 'shimmer 8s ease-in-out infinite',
                    opacity: 0.9,
                    zIndex: 1,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      linear-gradient(135deg,
                        rgba(67, 24, 255, 0.05) 0%,
                        transparent 50%,
                        rgba(4, 190, 254, 0.03) 100%
                      )`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `
                      0 25px 60px rgba(67, 24, 255, 0.25),
                      0 15px 35px rgba(0, 0, 0, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                    '&::before': {
                      height: '6px',
                      opacity: 1,
                    },
                  },
                }}
              >
                <CardContent>
                  {/* En-tête avec style ultra-premium */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={4}
                    sx={{
                      position: 'relative',
                      background: `
                        linear-gradient(135deg,
                          rgba(67, 24, 255, 0.08) 0%,
                          rgba(4, 190, 254, 0.06) 50%,
                          rgba(147, 51, 234, 0.04) 100%
                        )`,
                      borderRadius: '20px',
                      p: 3,
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box',
                      transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                          linear-gradient(135deg,
                            rgba(67, 24, 255, 0.1),
                            transparent,
                            rgba(4, 190, 254, 0.08)
                          )`,
                        borderRadius: '20px',
                        opacity: 0,
                        transition: 'opacity 2s ease',
                        zIndex: -1,
                      },
                      '&:hover': {
                        transform: 'scale(1.03) translateY(-4px)',
                        boxShadow: `
                          0 20px 50px rgba(67, 24, 255, 0.2),
                          0 10px 25px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        border: '2px solid rgba(67, 24, 255, 0.3)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box
                        sx={{
                          position: 'relative',
                          background: `
                            linear-gradient(135deg,
                              #4318FF 0%,
                              #04BEFE 50%,
                              #9333ea 100%
                            )`,
                          borderRadius: '20px',
                          p: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `
                            0 12px 30px rgba(67, 24, 255, 0.4),
                            0 6px 15px rgba(0, 0, 0, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.3)
                          `,
                          transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                              linear-gradient(45deg,
                                rgba(255, 255, 255, 0.2),
                                transparent,
                                rgba(255, 255, 255, 0.1)
                              )`,
                            borderRadius: '20px',
                            opacity: 0,
                            transition: 'opacity 2s ease',
                          },
                          '&:hover': {
                            transform: 'scale(1.15) rotate(8deg) translateY(-2px)',
                            boxShadow: `
                              0 20px 50px rgba(67, 24, 255, 0.5),
                              0 10px 25px rgba(0, 0, 0, 0.15),
                              inset 0 2px 0 rgba(255, 255, 255, 0.4)
                            `,
                            '&::before': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '28px',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                            transition: 'all 2s ease',
                          }}
                        >
                          ⏱️
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.05) translateY(-2px)',
                            },
                          }}
                        >
                          Analyse des Temps
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          Performance temporelle des livraisons
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            #4318FF 0%,
                            #04BEFE 50%,
                            #9333ea 100%
                          )`,
                        borderRadius: '25px',
                        px: 3,
                        py: 1.5,
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: `
                          0 8px 20px rgba(67, 24, 255, 0.4),
                          0 4px 10px rgba(0, 0, 0, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `
                            linear-gradient(90deg,
                              transparent,
                              rgba(255, 255, 255, 0.3),
                              transparent
                            )`,
                          transition: 'left 2s ease',
                        },
                        '&:hover': {
                          transform: 'scale(1.15) translateY(-3px) rotate(-2deg)',
                          boxShadow: `
                            0 15px 35px rgba(67, 24, 255, 0.5),
                            0 8px 20px rgba(0, 0, 0, 0.15),
                            inset 0 2px 0 rgba(255, 255, 255, 0.4)
                          `,
                          '&::before': {
                            left: '100%',
                          },
                        },
                      }}
                    >
                      {data.tempsLivraison.nombreCommandesAvecTemps} Commandes
                    </Box>
                  </Box>
                  {/* Métriques temporelles avec design ultra-moderne */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={3}
                    mb={4}
                  >
                    {/* Temps Minimum */}
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            rgba(16, 185, 129, 0.08),
                            rgba(5, 150, 105, 0.06)
                          )`,
                        borderRadius: '20px',
                        p: 3,
                        border: '2px solid rgba(16, 185, 129, 0.15)',
                        transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            linear-gradient(135deg,
                              rgba(16, 185, 129, 0.1),
                              transparent,
                              rgba(5, 150, 105, 0.08)
                            )`,
                          borderRadius: '20px',
                          opacity: 0,
                          transition: 'opacity 1.8s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `
                            0 20px 40px rgba(16, 185, 129, 0.25),
                            0 10px 20px rgba(0, 0, 0, 0.1)
                          `,
                          border: '2px solid rgba(16, 185, 129, 0.3)',
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '50px',
                          height: '50px',
                          borderRadius: '15px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          mb: 2,
                          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                          transition: 'all 1.8s ease',
                          '&:hover': {
                            transform: 'scale(1.2) rotate(10deg)',
                            boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '20px' }}>⚡</Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                        }}
                      >
                        {data.tempsLivraison.tempsMinHeures.toFixed(1)}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        ⚡ Temps Minimum
                      </Typography>
                    </Box>

                    {/* Temps Moyen */}
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            rgba(67, 24, 255, 0.08),
                            rgba(4, 190, 254, 0.06)
                          )`,
                        borderRadius: '20px',
                        p: 3,
                        border: '2px solid rgba(67, 24, 255, 0.15)',
                        transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            linear-gradient(135deg,
                              rgba(67, 24, 255, 0.1),
                              transparent,
                              rgba(4, 190, 254, 0.08)
                            )`,
                          borderRadius: '20px',
                          opacity: 0,
                          transition: 'opacity 1.8s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `
                            0 20px 40px rgba(67, 24, 255, 0.25),
                            0 10px 20px rgba(0, 0, 0, 0.1)
                          `,
                          border: '2px solid rgba(67, 24, 255, 0.3)',
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '50px',
                          height: '50px',
                          borderRadius: '15px',
                          background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                          mb: 2,
                          boxShadow: '0 8px 20px rgba(67, 24, 255, 0.3)',
                          transition: 'all 1.8s ease',
                          '&:hover': {
                            transform: 'scale(1.2) rotate(10deg)',
                            boxShadow: '0 12px 30px rgba(67, 24, 255, 0.4)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '20px' }}>📊</Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                        }}
                      >
                        {data.tempsLivraison.tempsMoyenHeures.toFixed(1)}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        📊 Temps Moyen
                      </Typography>
                    </Box>

                    {/* Temps Maximum */}
                    <Box
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            rgba(245, 158, 11, 0.08),
                            rgba(217, 119, 6, 0.06)
                          )`,
                        borderRadius: '20px',
                        p: 3,
                        border: '2px solid rgba(245, 158, 11, 0.15)',
                        transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            linear-gradient(135deg,
                              rgba(245, 158, 11, 0.1),
                              transparent,
                              rgba(217, 119, 6, 0.08)
                            )`,
                          borderRadius: '20px',
                          opacity: 0,
                          transition: 'opacity 1.8s ease',
                        },
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.05)',
                          boxShadow: `
                            0 20px 40px rgba(245, 158, 11, 0.25),
                            0 10px 20px rgba(0, 0, 0, 0.1)
                          `,
                          border: '2px solid rgba(245, 158, 11, 0.3)',
                          '&::before': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '50px',
                          height: '50px',
                          borderRadius: '15px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          mb: 2,
                          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
                          transition: 'all 1.8s ease',
                          '&:hover': {
                            transform: 'scale(1.2) rotate(10deg)',
                            boxShadow: '0 12px 30px rgba(245, 158, 11, 0.4)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '20px' }}>🔥</Typography>
                      </Box>
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1,
                        }}
                      >
                        {data.tempsLivraison.tempsMaxHeures.toFixed(1)}h
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        🔥 Temps Maximum
                      </Typography>
                    </Box>
                  </Box>

                  {/* Divider avec effet lumineux */}
                  <Box
                    sx={{
                      height: '2px',
                      background: `
                        linear-gradient(90deg,
                          transparent,
                          rgba(67, 24, 255, 0.3),
                          rgba(4, 190, 254, 0.3),
                          transparent
                        )`,
                      borderRadius: '1px',
                      my: 4,
                      animation: 'glow 2s ease-in-out infinite alternate',
                    }}
                  />

                  {/* Section de progression ultra-moderne */}
                  <Box
                    sx={{
                      background: `
                        linear-gradient(135deg,
                          rgba(255, 255, 255, 0.95),
                          rgba(248, 250, 252, 0.8)
                        )`,
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(67, 24, 255, 0.1)',
                      borderRadius: '20px',
                      p: 4,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.02) translateY(-2px)',
                        boxShadow: '0 20px 50px rgba(67, 24, 255, 0.1)',
                        border: '2px solid rgba(67, 24, 255, 0.2)',
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      mb={2}
                      sx={{ fontWeight: 600 }}
                    >
                      📊 Commandes avec données temporelles
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      sx={{
                        background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 3,
                      }}
                    >
                      {data.tempsLivraison.nombreCommandesAvecTemps} /{' '}
                      {data.statistiquesPrincipales.commandesLivrees}
                    </Typography>

                    {/* Barre de progression ultra-moderne */}
                    <Box
                      sx={{
                        height: '12px',
                        borderRadius: '6px',
                        background: 'rgba(67, 24, 255, 0.1)',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(67, 24, 255, 0.1)',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(data.tempsLivraison.nombreCommandesAvecTemps / Math.max(data.statistiquesPrincipales.commandesLivrees, 1)) * 100}%`,
                          background: `
                            linear-gradient(135deg,
                              #4318FF 0%,
                              #04BEFE 50%,
                              #9333ea 100%
                            )`,
                          borderRadius: '6px',
                          position: 'relative',
                          animation: 'progressFill 2s ease-out',
                          boxShadow: '0 2px 8px rgba(67, 24, 255, 0.3)',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `
                              linear-gradient(90deg,
                                transparent,
                                rgba(255,255,255,0.6),
                                transparent
                              )`,
                            animation: 'shimmer 2s ease-in-out infinite',
                          },
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={2}
                      sx={{ fontWeight: 500 }}
                    >
                      {(
                        (data.tempsLivraison.nombreCommandesAvecTemps /
                          Math.max(data.statistiquesPrincipales.commandesLivrees, 1)) *
                        100
                      ).toFixed(1)}
                      % de couverture
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}

          {/* Commandes récentes - Design Ultra-Futuriste */}
          {data.commandesRecentes && data.commandesRecentes.length > 0 && (
            <Grid item xs={12}>
              <StyledCard
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.98),
                      rgba(248, 250, 252, 0.95),
                      rgba(67, 24, 255, 0.02),
                      rgba(4, 190, 254, 0.02)
                    )`,
                  backdropFilter: 'blur(30px)',
                  border: '3px solid transparent',
                  borderImage: `
                    linear-gradient(135deg,
                      rgba(67, 24, 255, 0.3),
                      rgba(4, 190, 254, 0.2),
                      rgba(147, 51, 234, 0.25),
                      rgba(245, 158, 11, 0.2)
                    ) 1`,
                  borderRadius: '24px',
                  boxShadow: `
                    0 30px 80px rgba(67, 24, 255, 0.15),
                    0 20px 50px rgba(4, 190, 254, 0.1),
                    inset 0 2px 0 rgba(255, 255, 255, 0.8)
                  `,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: `
                      linear-gradient(90deg,
                        #4318FF 0%,
                        #04BEFE 20%,
                        #9333ea 40%,
                        #f59e0b 60%,
                        #ec4899 80%,
                        #4318FF 100%
                      )`,
                    backgroundSize: '500% 100%',
                    animation: 'shimmer 10s ease-in-out infinite',
                    opacity: 0.9,
                    zIndex: 2,
                    borderRadius: '24px 24px 0 0',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 80%, rgba(67, 24, 255, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(4, 190, 254, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.06) 0%, transparent 50%),
                      conic-gradient(from 0deg at 50% 50%, transparent, rgba(245, 158, 11, 0.05), transparent)
                    `,
                    pointerEvents: 'none',
                    zIndex: 0,
                    animation: 'float 12s ease-in-out infinite',
                  },
                  '&:hover': {
                    transform: 'translateY(-15px) scale(1.02)',
                    boxShadow: `
                      0 40px 100px rgba(67, 24, 255, 0.2),
                      0 25px 60px rgba(4, 190, 254, 0.15),
                      0 15px 35px rgba(0, 0, 0, 0.1),
                      inset 0 3px 0 rgba(255, 255, 255, 0.9)
                    `,
                    '&::before': {
                      height: '8px',
                      opacity: 1,
                      boxShadow: '0 0 20px rgba(67, 24, 255, 0.5)',
                    },
                    '&::after': {
                      opacity: 1.2,
                    },
                  },
                }}
              >
                <CardContent>
                  {/* En-tête avec style ultra-futuriste */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={4}
                    sx={{
                      position: 'relative',
                      background: `
                        linear-gradient(135deg,
                          rgba(67, 24, 255, 0.08) 0%,
                          rgba(4, 190, 254, 0.06) 25%,
                          rgba(147, 51, 234, 0.05) 50%,
                          rgba(245, 158, 11, 0.04) 75%,
                          rgba(236, 72, 153, 0.03) 100%
                        )`,
                      backgroundSize: '300% 300%',
                      animation: 'gradientShift 15s ease infinite',
                      borderRadius: '24px',
                      p: 3.5,
                      border: '3px solid transparent',
                      borderImage: `
                        linear-gradient(135deg,
                          rgba(67, 24, 255, 0.3),
                          rgba(4, 190, 254, 0.2),
                          rgba(147, 51, 234, 0.25)
                        ) 1`,
                      transition: 'all 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      boxShadow: `
                        0 15px 40px rgba(67, 24, 255, 0.1),
                        0 8px 20px rgba(4, 190, 254, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6)
                      `,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                          conic-gradient(from 0deg at 50% 50%,
                            rgba(67, 24, 255, 0.1) 0deg,
                            rgba(4, 190, 254, 0.08) 72deg,
                            rgba(147, 51, 234, 0.06) 144deg,
                            rgba(245, 158, 11, 0.05) 216deg,
                            rgba(236, 72, 153, 0.04) 288deg,
                            rgba(67, 24, 255, 0.1) 360deg
                          )`,
                        borderRadius: '24px',
                        opacity: 0,
                        transition: 'opacity 2.5s ease',
                        zIndex: -1,
                        animation: 'rotate 30s linear infinite',
                      },
                      '&:hover': {
                        transform: 'scale(1.04) translateY(-6px)',
                        boxShadow: `
                          0 25px 60px rgba(67, 24, 255, 0.2),
                          0 15px 35px rgba(4, 190, 254, 0.15),
                          0 10px 25px rgba(0, 0, 0, 0.1),
                          inset 0 2px 0 rgba(255, 255, 255, 0.7)
                        `,
                        border: '3px solid rgba(67, 24, 255, 0.4)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box
                        sx={{
                          position: 'relative',
                          background: `
                            linear-gradient(135deg,
                              #4318FF 0%,
                              #04BEFE 30%,
                              #9333ea 60%,
                              #ec4899 100%
                            )`,
                          backgroundSize: '300% 300%',
                          animation: 'gradientShift 8s ease infinite',
                          borderRadius: '24px',
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `
                            0 15px 40px rgba(67, 24, 255, 0.4),
                            0 8px 20px rgba(4, 190, 254, 0.3),
                            0 4px 10px rgba(0, 0, 0, 0.1),
                            inset 0 2px 0 rgba(255, 255, 255, 0.4)
                          `,
                          transition: 'all 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                              conic-gradient(from 0deg,
                                rgba(255, 255, 255, 0.3),
                                transparent,
                                rgba(255, 255, 255, 0.2),
                                transparent,
                                rgba(255, 255, 255, 0.1)
                              )`,
                            borderRadius: '24px',
                            opacity: 0,
                            transition: 'opacity 2.5s ease',
                            animation: 'rotate 20s linear infinite',
                          },
                          '&:hover': {
                            transform: 'scale(1.2) rotate(12deg) translateY(-4px)',
                            boxShadow: `
                              0 25px 60px rgba(67, 24, 255, 0.5),
                              0 15px 35px rgba(4, 190, 254, 0.4),
                              0 8px 20px rgba(0, 0, 0, 0.15),
                              inset 0 3px 0 rgba(255, 255, 255, 0.5)
                            `,
                            '&::before': {
                              opacity: 1,
                            },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '28px',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                            transition: 'all 2s ease',
                          }}
                        >
                          📋
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            background: `
                              linear-gradient(135deg,
                                #4318FF 0%,
                                #04BEFE 25%,
                                #9333ea 50%,
                                #ec4899 75%,
                                #f59e0b 100%
                              )`,
                            backgroundSize: '300% 100%',
                            animation: 'shimmer 6s ease infinite',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: '0 4px 8px rgba(67, 24, 255, 0.3)',
                            '&:hover': {
                              transform: 'scale(1.08) translateY(-3px)',
                              filter: 'drop-shadow(0 6px 12px rgba(67, 24, 255, 0.4))',
                            },
                          }}
                        >
                          Commandes Récentes
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            mt: 0.5,
                          }}
                        >
                          Historique des dernières commandes
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: 'relative',
                        background: `
                          linear-gradient(135deg,
                            #4318FF 0%,
                            #04BEFE 25%,
                            #9333ea 50%,
                            #ec4899 75%,
                            #f59e0b 100%
                          )`,
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 10s ease infinite',
                        borderRadius: '30px',
                        px: 3.5,
                        py: 2,
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        boxShadow: `
                          0 12px 30px rgba(67, 24, 255, 0.4),
                          0 6px 15px rgba(4, 190, 254, 0.3),
                          0 3px 8px rgba(0, 0, 0, 0.1),
                          inset 0 2px 0 rgba(255, 255, 255, 0.4)
                        `,
                        transition: 'all 2.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: `
                            linear-gradient(90deg,
                              transparent,
                              rgba(255, 255, 255, 0.4),
                              rgba(255, 255, 255, 0.6),
                              rgba(255, 255, 255, 0.4),
                              transparent
                            )`,
                          transition: 'left 2.5s ease',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: `
                            conic-gradient(from 0deg,
                              transparent,
                              rgba(255, 255, 255, 0.1),
                              transparent
                            )`,
                          animation: 'rotate 15s linear infinite',
                          pointerEvents: 'none',
                        },
                        '&:hover': {
                          transform: 'scale(1.2) translateY(-4px) rotate(-3deg)',
                          boxShadow: `
                            0 20px 50px rgba(67, 24, 255, 0.5),
                            0 12px 30px rgba(4, 190, 254, 0.4),
                            0 6px 15px rgba(0, 0, 0, 0.15),
                            inset 0 3px 0 rgba(255, 255, 255, 0.5)
                          `,
                          '&::before': {
                            left: '100%',
                          },
                        },
                      }}
                    >
                      {data.commandesRecentes.length} Commande
                      {data.commandesRecentes.length > 1 ? 's' : ''}
                    </Box>
                  </Box>
                  {/* Liste des commandes avec design ultra-moderne */}
                  <Box sx={{ mt: 2 }}>
                    {data.commandesRecentes.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 6,
                          background: `
                            linear-gradient(135deg,
                              rgba(67, 24, 255, 0.05),
                              rgba(4, 190, 254, 0.03)
                            )`,
                          borderRadius: '16px',
                          border: '2px dashed rgba(67, 24, 255, 0.2)',
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{
                            mb: 1,
                            fontWeight: 600,
                            background: `
                              linear-gradient(135deg,
                                #4318FF 0%,
                                #04BEFE 100%
                              )`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          📭 Aucune commande trouvée
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Aucune commande créée pendant la période "{getPeriodeLabel(periode)}"
                        </Typography>
                      </Box>
                    ) : (
                      data.commandesRecentes.map((commande, index) => (
                        <Box
                          key={commande.id}
                          sx={{
                            position: 'relative',
                            background: `
                            linear-gradient(135deg,
                              rgba(255, 255, 255, 0.95),
                              rgba(248, 250, 252, 0.9),
                              rgba(67, 24, 255, 0.01),
                              rgba(4, 190, 254, 0.01)
                            )`,
                            backdropFilter: 'blur(20px)',
                            border: '2px solid transparent',
                            borderImage: `
                            linear-gradient(135deg,
                              rgba(67, 24, 255, 0.2),
                              rgba(4, 190, 254, 0.15),
                              rgba(147, 51, 234, 0.1)
                            ) 1`,
                            borderRadius: '20px',
                            p: 3.5,
                            mb: index < data.commandesRecentes.length - 1 ? 3 : 0,
                            transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden',
                            boxShadow: `
                            0 8px 25px rgba(67, 24, 255, 0.08),
                            0 4px 12px rgba(4, 190, 254, 0.06),
                            inset 0 1px 0 rgba(255, 255, 255, 0.7)
                          `,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `
                              radial-gradient(circle at 30% 70%, rgba(67, 24, 255, 0.06) 0%, transparent 50%),
                              radial-gradient(circle at 70% 30%, rgba(4, 190, 254, 0.05) 0%, transparent 50%),
                              linear-gradient(135deg, rgba(147, 51, 234, 0.03), transparent, rgba(245, 158, 11, 0.02))
                            `,
                              borderRadius: '20px',
                              opacity: 0,
                              transition: 'opacity 2s ease',
                              zIndex: -1,
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '3px',
                              background: `
                              linear-gradient(90deg,
                                #4318FF,
                                #04BEFE,
                                #9333ea,
                                #ec4899
                              )`,
                              backgroundSize: '300% 100%',
                              animation: 'shimmer 8s ease infinite',
                              borderRadius: '20px 20px 0 0',
                              opacity: 0,
                              transition: 'opacity 2s ease',
                            },
                            '&:hover': {
                              transform: 'translateY(-10px) scale(1.03)',
                              boxShadow: `
                              0 20px 50px rgba(67, 24, 255, 0.15),
                              0 12px 30px rgba(4, 190, 254, 0.12),
                              0 6px 15px rgba(0, 0, 0, 0.1),
                              inset 0 2px 0 rgba(255, 255, 255, 0.8)
                            `,
                              border: '2px solid rgba(67, 24, 255, 0.3)',
                              '&::before': {
                                opacity: 1,
                              },
                              '&::after': {
                                opacity: 1,
                                height: '4px',
                              },
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={3}>
                            {/* Icône de statut avec design premium */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: `
                                linear-gradient(135deg,
                                  ${getStatutColor(commande.statut)}20,
                                  ${getStatutColor(commande.statut)}10
                                )`,
                                border: `2px solid ${getStatutColor(commande.statut)}30`,
                                transition: 'all 1.5s ease',
                                '&:hover': {
                                  transform: 'scale(1.2) rotate(10deg)',
                                  background: `
                                  linear-gradient(135deg,
                                    ${getStatutColor(commande.statut)}30,
                                    ${getStatutColor(commande.statut)}20
                                  )`,
                                  border: `3px solid ${getStatutColor(commande.statut)}50`,
                                  boxShadow: `0 8px 25px ${getStatutColor(commande.statut)}30`,
                                },
                              }}
                            >
                              <Typography sx={{ fontSize: '24px' }}>
                                {getStatutEmoji(commande.statut)}
                              </Typography>
                            </Box>

                            {/* Contenu de la commande */}
                            <Box flex={1}>
                              {/* En-tête avec ID et montant */}
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight="bold"
                                  sx={{
                                    background: `
                                    linear-gradient(135deg,
                                      #4318FF 0%,
                                      #04BEFE 50%,
                                      #9333ea 100%
                                    )`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    transition: 'all 1.5s ease',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      filter: 'drop-shadow(0 2px 4px rgba(67, 24, 255, 0.3))',
                                    },
                                  }}
                                >
                                  Commande #{commande.id}
                                </Typography>

                                <Box
                                  sx={{
                                    background: `
                                    linear-gradient(135deg,
                                      #f59e0b 0%,
                                      #ec4899 50%,
                                      #8b5cf6 100%
                                    )`,
                                    borderRadius: '16px',
                                    px: 2.5,
                                    py: 1,
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                    boxShadow: `
                                    0 6px 18px rgba(245, 158, 11, 0.3),
                                    0 3px 9px rgba(236, 72, 153, 0.2),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                  `,
                                    transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: '-100%',
                                      width: '100%',
                                      height: '100%',
                                      background: `
                                      linear-gradient(90deg,
                                        transparent,
                                        rgba(255, 255, 255, 0.3),
                                        transparent
                                      )`,
                                      transition: 'left 2s ease',
                                    },
                                    '&:hover': {
                                      transform: 'scale(1.15) translateY(-3px) rotate(2deg)',
                                      boxShadow: `
                                      0 10px 25px rgba(245, 158, 11, 0.4),
                                      0 6px 15px rgba(236, 72, 153, 0.3),
                                      inset 0 2px 0 rgba(255, 255, 255, 0.4)
                                    `,
                                      '&::before': {
                                        left: '100%',
                                      },
                                    },
                                  }}
                                >
                                  {commande.montantTotale.toFixed(2)} DT
                                </Box>
                              </Box>

                              {/* Adresse avec icône */}
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Typography sx={{ fontSize: '16px' }}>📍</Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 500,
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {commande.adresseLivraison}
                                </Typography>
                              </Box>

                              {/* Date avec icône */}
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography sx={{ fontSize: '16px' }}>📅</Typography>
                                <Typography
                                  variant="caption"
                                  color="white"
                                  sx={{
                                    fontWeight: 700,
                                    background: `
                                    linear-gradient(135deg,
                                      #06b6d4 0%,
                                      #3b82f6 50%,
                                      #6366f1 100%
                                    )`,
                                    px: 2,
                                    py: 0.8,
                                    borderRadius: '12px',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                    boxShadow: `
                                    0 4px 12px rgba(6, 182, 212, 0.3),
                                    0 2px 6px rgba(59, 130, 246, 0.2),
                                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                                  `,
                                    transition: 'all 1.5s ease',
                                    display: 'inline-block',
                                    '&:hover': {
                                      transform: 'scale(1.1) translateY(-2px)',
                                      boxShadow: `
                                      0 6px 18px rgba(6, 182, 212, 0.4),
                                      0 3px 9px rgba(59, 130, 246, 0.3),
                                      inset 0 2px 0 rgba(255, 255, 255, 0.4)
                                    `,
                                    },
                                  }}
                                >
                                  {new Date(commande.dateCreation).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
};

export default RapportLivreurIndividuel;
