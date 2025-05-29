import {
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const shimmer = keyframes`
  0% {
    background-position: -300% 0;
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    background-position: 300% 0;
    opacity: 0.6;
  }
`;

const rainbowShimmer = keyframes`
  0% {
    background-position: 0% 50%;
    filter: hue-rotate(0deg) brightness(1);
  }
  25% {
    background-position: 50% 50%;
    filter: hue-rotate(90deg) brightness(1.1);
  }
  50% {
    background-position: 100% 50%;
    filter: hue-rotate(180deg) brightness(1.2);
  }
  75% {
    background-position: 50% 50%;
    filter: hue-rotate(270deg) brightness(1.1);
  }
  100% {
    background-position: 0% 50%;
    filter: hue-rotate(360deg) brightness(1);
  }
`;

const gentleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg) scale(1);
    box-shadow: 0 8px 25px rgba(67, 24, 255, 0.15), 0 4px 12px rgba(4, 190, 254, 0.1);
    filter: brightness(1) saturate(1);
  }
  25% {
    transform: translateY(-4px) rotate(1deg) scale(1.02);
    box-shadow: 0 12px 35px rgba(67, 24, 255, 0.2), 0 6px 18px rgba(4, 190, 254, 0.15);
    filter: brightness(1.05) saturate(1.1);
  }
  50% {
    transform: translateY(-8px) rotate(2deg) scale(1.03);
    box-shadow: 0 16px 45px rgba(67, 24, 255, 0.25), 0 8px 25px rgba(4, 190, 254, 0.2);
    filter: brightness(1.1) saturate(1.2);
  }
  75% {
    transform: translateY(-4px) rotate(1deg) scale(1.02);
    box-shadow: 0 12px 35px rgba(67, 24, 255, 0.2), 0 6px 18px rgba(4, 190, 254, 0.15);
    filter: brightness(1.05) saturate(1.1);
  }
`;

const softPulse = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1) saturate(1) hue-rotate(0deg);
    box-shadow: 0 8px 25px rgba(67, 24, 255, 0.15);
  }
  25% {
    transform: scale(1.02) rotate(0.5deg);
    filter: brightness(1.05) saturate(1.1) hue-rotate(15deg);
    box-shadow: 0 12px 35px rgba(67, 24, 255, 0.2);
  }
  50% {
    transform: scale(1.05) rotate(1deg);
    filter: brightness(1.1) saturate(1.2) hue-rotate(30deg);
    box-shadow: 0 16px 45px rgba(67, 24, 255, 0.25);
  }
  75% {
    transform: scale(1.02) rotate(0.5deg);
    filter: brightness(1.05) saturate(1.1) hue-rotate(15deg);
    box-shadow: 0 12px 35px rgba(67, 24, 255, 0.2);
  }
`;

const morphingGlow = keyframes`
  0%, 100% {
    box-shadow:
      0 0 30px rgba(67, 24, 255, 0.4),
      0 0 60px rgba(67, 24, 255, 0.2),
      0 0 90px rgba(67, 24, 255, 0.1);
    filter: hue-rotate(0deg) brightness(1);
  }
  20% {
    box-shadow:
      0 0 30px rgba(4, 190, 254, 0.4),
      0 0 60px rgba(4, 190, 254, 0.2),
      0 0 90px rgba(4, 190, 254, 0.1);
    filter: hue-rotate(72deg) brightness(1.1);
  }
  40% {
    box-shadow:
      0 0 30px rgba(16, 185, 129, 0.4),
      0 0 60px rgba(16, 185, 129, 0.2),
      0 0 90px rgba(16, 185, 129, 0.1);
    filter: hue-rotate(144deg) brightness(1.2);
  }
  60% {
    box-shadow:
      0 0 30px rgba(255, 206, 32, 0.4),
      0 0 60px rgba(255, 206, 32, 0.2),
      0 0 90px rgba(255, 206, 32, 0.1);
    filter: hue-rotate(216deg) brightness(1.1);
  }
  80% {
    box-shadow:
      0 0 30px rgba(238, 93, 80, 0.4),
      0 0 60px rgba(238, 93, 80, 0.2),
      0 0 90px rgba(238, 93, 80, 0.1);
    filter: hue-rotate(288deg) brightness(1.05);
  }
`;

const slideInFromLeft = keyframes`
  0% {
    transform: translateX(-100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  0% {
    transform: translateX(100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
`;

const rotateIn = keyframes`
  0% {
    transform: rotate(-180deg) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
`;

// Styled components
const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(5),
  padding: theme.spacing(5),
  borderRadius: '40px',
  background:
    'linear-gradient(145deg, rgba(67, 24, 255, 0.08), rgba(4, 190, 254, 0.06), rgba(16, 185, 129, 0.04))',
  border: '3px solid transparent',
  backgroundClip: 'padding-box',
  backdropFilter: 'blur(35px)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 30px 100px rgba(67, 24, 255, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.25)',
  animation: `${slideInFromLeft} 4s ease-out, ${morphingGlow} 45s infinite`,
  transition: 'all 2.5s cubic-bezier(0.23, 1, 0.32, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    background: 'linear-gradient(90deg, #4318FF, #04BEFE, #10b981, #FFCE20, #EE5D50, #8b5cf6)',
    backgroundSize: '600% 100%',
    animation: `${rainbowShimmer} 35s infinite`,
    borderRadius: '40px 40px 0 0',
    opacity: 0.9,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '300%',
    height: '300%',
    background:
      'radial-gradient(circle, rgba(67, 24, 255, 0.12) 0%, rgba(4, 190, 254, 0.08) 30%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
    transition: 'all 3s cubic-bezier(0.23, 1, 0.32, 1)',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-15px) scale(1.03) rotateX(2deg)',
    boxShadow: '0 50px 150px rgba(67, 24, 255, 0.3), inset 0 3px 0 rgba(255, 255, 255, 0.4)',
    background:
      'linear-gradient(145deg, rgba(67, 24, 255, 0.12), rgba(4, 190, 254, 0.1), rgba(16, 185, 129, 0.08))',
    '&::after': {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1.2) rotate(180deg)',
    },
    '&::before': {
      height: '12px',
      backgroundSize: '400% 100%',
      opacity: 1,
    },
  },
}));

const StatsCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: '40px',
  background:
    'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9))',
  backdropFilter: 'blur(40px)',
  border: '3px solid transparent',
  backgroundClip: 'padding-box',
  boxShadow: '0 40px 120px rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.5)',
  marginBottom: theme.spacing(6),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 2.8s cubic-bezier(0.23, 1, 0.32, 1)',
  animation: `${slideInFromRight} 5s ease-out, ${morphingGlow} 60s infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    background: 'linear-gradient(90deg, #4318FF, #04BEFE, #10b981, #FFCE20, #EE5D50)',
    backgroundSize: '500% 100%',
    animation: `${rainbowShimmer} 40s infinite`,
    borderRadius: '40px 40px 0 0',
    opacity: 0.9,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '400px',
    height: '400px',
    background:
      'radial-gradient(circle, rgba(67, 24, 255, 0.15) 0%, rgba(4, 190, 254, 0.1) 30%, rgba(16, 185, 129, 0.05) 60%, transparent 80%)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
    transition: 'all 3.2s cubic-bezier(0.23, 1, 0.32, 1)',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-20px) scale(1.04) rotateX(8deg) rotateY(2deg)',
    boxShadow: '0 60px 180px rgba(67, 24, 255, 0.25), inset 0 3px 0 rgba(255, 255, 255, 0.7)',
    background:
      'linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.95))',
    '&::after': {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1.5) rotate(360deg)',
    },
    '&::before': {
      height: '12px',
      backgroundSize: '300% 100%',
      opacity: 1,
    },
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 400,
  padding: theme.spacing(3),
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.8))',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
  marginBottom: theme.spacing(4),
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
    animation: `${shimmer} 8s infinite`,
    opacity: 0.8,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.12)',
  },
}));

const StatusCard = styled(ListItem)(({ theme }) => ({
  borderRadius: '28px',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
  backdropFilter: 'blur(25px)',
  border: '3px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(67, 24, 255, 0.04)',
  transition: 'all 2.5s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background:
      'linear-gradient(90deg, transparent, rgba(67, 24, 255, 0.1), rgba(4, 190, 254, 0.08), transparent)',
    transition: 'left 2.8s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '&::after': {
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
    transition: 'opacity 2.5s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.03) rotateX(2deg)',
    boxShadow: '0 25px 80px rgba(67, 24, 255, 0.15), 0 8px 30px rgba(4, 190, 254, 0.1)',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))',
    border: '3px solid rgba(67, 24, 255, 0.2)',
    '&::before': {
      left: '100%',
    },
    '&::after': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.05), rgba(4, 190, 254, 0.05))',
    },
  },
  '&:last-child': {
    marginBottom: 0,
  },
}));

const PeriodChip = styled(Chip)(() => ({
  background:
    'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.1))',
  border: '3px solid transparent',
  backgroundClip: 'padding-box',
  backdropFilter: 'blur(15px)',
  color: '#6366f1',
  fontWeight: 800,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${rotateIn} 3s ease-out, ${softPulse} 6s infinite`,
  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  '& .MuiChip-label': {
    padding: '12px 20px',
    position: 'relative',
    zIndex: 2,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 2.5s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 2,
    borderRadius: '17px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    opacity: 0,
    transition: 'opacity 2s ease',
  },
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.2))',
    transform: 'scale(1.1) rotateY(10deg)',
    boxShadow: '0 16px 48px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    color: '#4338ca',
    '&::before': {
      left: '100%',
    },
    '&::after': {
      opacity: 1,
    },
  },
}));

const StatusIndicator = styled(Box)<{ statusColor: string }>(({ statusColor }) => ({
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: statusColor,
  marginRight: 16,
  flexShrink: 0,
  position: 'relative',
  boxShadow: `0 4px 12px ${statusColor}40`,
  animation: `${gentleFloat} 6s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

const StatusChip = styled(Chip)<{ statusColor: string }>(({ statusColor }) => ({
  backgroundColor: statusColor,
  color: 'white',
  fontWeight: 700,
  fontSize: '0.75rem',
  borderRadius: '12px',
  boxShadow: `0 4px 12px ${statusColor}40`,
  transition: 'all 1.2s ease',
  animation: `${softPulse} 4s ease-in-out infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 6px 20px ${statusColor}60`,
  },
}));

interface RepartitionStatutsData {
  repartitionStatuts: Array<{
    statut: string;
    nombre: number;
    pourcentage: number;
  }>;
  total: number;
}

interface RepartitionStatutsProps {
  data: RepartitionStatutsData | null;
  periode: string;
}

const RepartitionStatuts = ({ data, periode }: RepartitionStatutsProps) => {
  if (!data || !data.repartitionStatuts) {
    return (
      <CardContent>
        <Typography variant="h6">Chargement de la répartition des statuts...</Typography>
      </CardContent>
    );
  }

  const getPeriodeLabel = (periode: string) => {
    switch (periode) {
      case 'jour':
        return "aujourd'hui";
      case 'semaine':
        return 'cette semaine';
      case 'mois':
        return 'ce mois';
      case 'annee':
        return 'cette année';
      default:
        return 'cette période';
    }
  };

  const repartitionData = data.repartitionStatuts || [];
  const total = data.total || 0;

  if (repartitionData.length === 0 || total === 0) {
    return (
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold" color="primary">
            📊 Répartition des Statuts
          </Typography>
          <Chip label={getPeriodeLabel(periode)} color="primary" variant="outlined" size="small" />
        </Box>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Aucune commande trouvée {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      </CardContent>
    );
  }

  // Définir les couleurs pour chaque statut selon le thème du projet
  const getStatutColor = (statut: string) => {
    const statutLower = statut.toLowerCase();
    switch (statutLower) {
      case 'livré':
      case 'livre':
        return '#05CD99'; // Success green
      case 'en transit':
        return '#FFCE20'; // Warning yellow
      case 'en préparation':
      case 'en preparation':
        return '#04BEFE'; // Secondary sky blue
      case 'confirmé':
      case 'confirme':
      case 'confirmée':
      case 'confirmee':
        return '#4318FF'; // Primary purple
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

  // Formater le nom du statut pour l'affichage
  const formatStatutName = (statut: string) => {
    const statutLower = statut.toLowerCase();
    switch (statutLower) {
      case 'livre':
        return 'Livré';
      case 'en preparation':
        return 'En Préparation';
      case 'confirme':
      case 'confirmee':
        return 'Confirmé';
      case 'annule':
      case 'annulee':
        return 'Annulé';
      default:
        return statut.charAt(0).toUpperCase() + statut.slice(1);
    }
  };

  // Préparer les données pour le graphique en camembert
  const pieData = repartitionData.map((item) => ({
    value: item.nombre,
    name: formatStatutName(item.statut),
    itemStyle: {
      color: getStatutColor(item.statut),
    },
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 2,
      borderRadius: 16,
      padding: [16, 20],
      textStyle: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: 600,
      },
      formatter: function (params: {
        name: string;
        value: number;
        percent: number;
        color: string;
      }) {
        const statusIcon =
          params.name === 'Livré'
            ? '✅'
            : params.name === 'En Transit'
              ? '🚚'
              : params.name === 'En Préparation'
                ? '📦'
                : params.name === 'Confirmé'
                  ? '✔️'
                  : params.name === 'Annulé'
                    ? '❌'
                    : '📋';

        return `<div style="font-weight: 800; margin-bottom: 12px; color: #6366f1; font-size: 16px;">
                  ${statusIcon} ${params.name}
                </div>
                <div style="display: flex; align-items: center; margin: 8px 0;">
                  <span style="display: inline-block; width: 14px; height: 14px; background: ${params.color}; border-radius: 50%; margin-right: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></span>
                  <span style="font-weight: 700; color: #374151;">Nombre:</span>
                  <span style="margin-left: 8px; font-weight: 800; color: ${params.color}; font-size: 16px;">${params.value}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 8px 0;">
                  <span style="display: inline-block; width: 14px; height: 14px; background: linear-gradient(45deg, ${params.color}, ${params.color}80); border-radius: 50%; margin-right: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></span>
                  <span style="font-weight: 700; color: #374151;">Pourcentage:</span>
                  <span style="margin-left: 8px; font-weight: 800; color: ${params.color}; font-size: 16px;">${params.percent}%</span>
                </div>`;
      },
      extraCssText: 'box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px);',
    },
    legend: {
      orient: 'vertical',
      left: '8%',
      top: 'middle',
      itemGap: 20,
      textStyle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#374151',
      },
      itemWidth: 18,
      itemHeight: 18,
      icon: 'circle',
      formatter: function (name: string) {
        const statusIcon =
          name === 'Livré'
            ? '✅'
            : name === 'En Transit'
              ? '🚚'
              : name === 'En Préparation'
                ? '📦'
                : name === 'Confirmé'
                  ? '✔️'
                  : name === 'Annulé'
                    ? '❌'
                    : '📋';
        return `${statusIcon} ${name}`;
      },
    },
    series: [
      {
        name: 'Répartition des Statuts',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 3,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 15,
          shadowOffsetY: 5,
        },
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetY: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 4,
            borderColor: 'rgba(255, 255, 255, 0.9)',
          },
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
            formatter: '{d}%',
            textBorderColor: 'rgba(255, 255, 255, 0.8)',
            textBorderWidth: 2,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowBlur: 4,
          },
          scaleSize: 12,
        },
        labelLine: {
          show: false,
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx: number) {
          return idx * 500;
        },
        data: pieData.map((item) => ({
          ...item,
          itemStyle: {
            ...item.itemStyle,
            shadowColor: `${item.itemStyle.color}40`,
            shadowBlur: 20,
            shadowOffsetY: 6,
          },
        })),
      },
    ],
    animationDuration: 4000,
    animationEasing: 'cubicOut',
  };

  // Trouver le statut dominant
  const statutDominant = repartitionData.reduce((prev, current) =>
    prev.nombre > current.nombre ? prev : current,
  );

  return (
    <CardContent sx={{ padding: 0 }}>
      {/* Header moderne */}
      <HeaderContainer>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
              position: 'relative',
              transition: 'all 25s cubic-bezier(0.23, 1, 0.32, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 2,
                borderRadius: '18px',
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                transition: 'all 20s cubic-bezier(0.23, 1, 0.32, 1)',
              },
              '&:hover': {
                transform: 'scale(1.3) rotate(25deg) translateY(-15px)',
                background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 50%, #10b981 100%)',
                boxShadow: '0 30px 100px rgba(67, 24, 255, 0.8)',
                '&::before': {
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2))',
                },
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '2rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                animation: `${gentleFloat} 6s ease-in-out infinite`,
                transition: 'all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.3) rotate(-15deg) translateY(-5px)',
                  filter: 'drop-shadow(0 12px 35px rgba(255, 255, 255, 0.8))',
                },
              }}
            >
              📊
            </Typography>
          </Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              transition: 'all 2.5s cubic-bezier(0.23, 1, 0.32, 1)',
              '&:hover': {
                transform: 'scale(1.15) translateY(-8px) rotateX(5deg)',
                background: 'linear-gradient(135deg, #4318FF 0%, #04BEFE 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 15px 50px rgba(67, 24, 255, 0.5)',
                filter: 'drop-shadow(0 8px 25px rgba(67, 24, 255, 0.3))',
              },
            }}
          >
            Répartition des Statuts
          </Typography>
        </Box>
        <PeriodChip label={getPeriodeLabel(periode)} />
      </HeaderContainer>

      {/* Statistique principale moderne */}
      <Fade in timeout={2000}>
        <StatsCard>
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
              sx={{
                fontSize: '3rem',
                filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))',
                animation: `${softPulse} 4s ease-in-out infinite`,
                transition: 'all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.25) rotate(20deg) translateY(-8px)',
                  filter: 'drop-shadow(0 12px 35px rgba(99, 102, 241, 0.7))',
                },
              }}
            >
              📈
            </Typography>
          </Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
              animation: `${softPulse} 5s ease-in-out infinite`,
              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                transform: 'scale(1.1) translateY(-3px)',
                textShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            {total}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            fontWeight="600"
            mb={2}
            sx={{
              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                transform: 'scale(1.05) translateY(-2px)',
                color: '#6366f1',
              },
            }}
          >
            Total des commandes {getPeriodeLabel(periode)}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              padding: '8px 16px',
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${getStatutColor(statutDominant.statut)}20, ${getStatutColor(statutDominant.statut)}10)`,
              border: `2px solid ${getStatutColor(statutDominant.statut)}40`,
              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                transform: 'scale(1.1) translateY(-5px)',
                background: `linear-gradient(135deg, ${getStatutColor(statutDominant.statut)}30, ${getStatutColor(statutDominant.statut)}20)`,
                border: `3px solid ${getStatutColor(statutDominant.statut)}60`,
                boxShadow: `0 12px 35px ${getStatutColor(statutDominant.statut)}40`,
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight="600"
              sx={{
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  color: '#6366f1',
                },
              }}
            >
              Statut dominant:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="800"
              sx={{
                color: getStatutColor(statutDominant.statut),
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.1) translateY(-2px)',
                  textShadow: `0 8px 25px ${getStatutColor(statutDominant.statut)}60`,
                },
              }}
            >
              {formatStatutName(statutDominant.statut)} ({statutDominant.pourcentage}%)
            </Typography>
          </Box>
        </StatsCard>
      </Fade>

      {/* Graphique en camembert moderne */}
      <Fade in timeout={2500}>
        <ChartContainer
          sx={{
            transition: 'all 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              transform: 'scale(1.02) translateY(-5px)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <ReactEchart echarts={echarts} option={option} />
        </ChartContainer>
      </Fade>

      {/* Liste détaillée moderne */}
      <Fade in timeout={3000}>
        <Box
          sx={{
            transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              transform: 'translateY(-3px)',
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={3}
            sx={{
              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                transform: 'scale(1.02) translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)',
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.15) rotate(10deg) translateY(-5px)',
                  boxShadow: '0 12px 35px rgba(99, 102, 241, 0.6)',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'scale(1.2) rotate(-10deg)',
                    filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.8))',
                  },
                }}
              >
                📋
              </Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-3px)',
                  background: 'linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                },
              }}
            >
              Détail par Statut
            </Typography>
          </Box>
          <List
            sx={{
              padding: 0,
              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                transform: 'scale(1.01) translateY(-2px)',
              },
            }}
          >
            {repartitionData
              .sort((a, b) => b.nombre - a.nombre)
              .map((item, index: number) => (
                <Fade in timeout={3500 + index * 500} key={index}>
                  <StatusCard>
                    <StatusIndicator statusColor={getStatutColor(item.statut)} />
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                              transform: 'scale(1.02) translateY(-2px)',
                            },
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight="700"
                            color="text.primary"
                            sx={{
                              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              '&:hover': {
                                transform: 'scale(1.05) translateY(-2px)',
                                color: getStatutColor(item.statut),
                                textShadow: `0 4px 12px ${getStatutColor(item.statut)}40`,
                              },
                            }}
                          >
                            {formatStatutName(item.statut)}
                          </Typography>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            sx={{
                              transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                              '&:hover': {
                                transform: 'scale(1.05) translateY(-3px)',
                              },
                            }}
                          >
                            <StatusChip
                              statusColor={getStatutColor(item.statut)}
                              label={`${item.nombre}`}
                              size="small"
                            />
                            <Typography
                              variant="body1"
                              fontWeight="700"
                              sx={{
                                color: getStatutColor(item.statut),
                                minWidth: '60px',
                                textAlign: 'right',
                                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                '&:hover': {
                                  transform: 'scale(1.1) translateY(-2px)',
                                  textShadow: `0 8px 25px ${getStatutColor(item.statut)}60`,
                                  filter: 'brightness(1.2)',
                                },
                              }}
                            >
                              {item.pourcentage}%
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </StatusCard>
                </Fade>
              ))}
          </List>
        </Box>
      </Fade>
    </CardContent>
  );
};

export default RepartitionStatuts;
