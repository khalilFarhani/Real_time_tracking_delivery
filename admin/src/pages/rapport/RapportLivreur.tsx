import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Autocomplete,
  TextField,
  Avatar,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { generateLivreurReportPDF } from '../../utils/pdfGenerator';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';

// Import des composants de graphiques
import StatistiquesGlobales from './components/StatistiquesGlobales';
import EvolutionTemporelle from './components/EvolutionTemporelle';
import TopLivreurs from './components/TopLivreurs';
import TempsTraitement from './components/TempsTraitement';
import RepartitionStatuts from './components/RepartitionStatuts';

const API_URL = 'http://localhost:5283';

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

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

interface Livreur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  imagePath?: string;
}

interface LivreurAPI {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  imagePath?: string;
}

interface RapportData {
  statistiquesGlobales: {
    totalLivreurs: number;
    livreursActifs: number;
    totalCommandesPeriode: number;
    commandesLivreesPeriode: number;
    revenusTotalPeriode: number;
    tauxLivraisonGlobal: number;
    revenuMoyenParCommande: number;
  };

  evolutionTemporelle: {
    evolution: Array<{
      periode: string;
      commandesTotales: number;
      commandesLivrees: number;
      revenus: number;
      livreursActifs: number;
    }>;
  };
  topLivreurs: {
    topLivreurs: Array<{
      livreurId: number;
      nomLivreur: string;
      imagePath: string;
      commandesLivrees: number;
      commandesTotales: number;
      revenusGeneres: number;
      tauxLivraison: number;
      score: number;
    }>;
  };
  tempsTraitement: {
    livreursTempsTraitement: Array<{
      livreurId: number;
      nomLivreur: string;
      nombreCommandesLivrees: number;
      tempsMoyenHeures: number;
      tempsMinHeures: number;
      tempsMaxHeures: number;
    }>;
  };
  repartitionStatuts: {
    repartitionStatuts: Array<{
      statut: string;
      nombre: number;
      pourcentage: number;
    }>;
    total: number;
  };
}

const RapportLivreur = () => {
  const navigate = useNavigate();
  const [periode, setPeriode] = useState<Periode | ''>('mois');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RapportData | null>(null);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [loadingLivreurs, setLoadingLivreurs] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePeriodeChange = (event: SelectChangeEvent<Periode>) => {
    setPeriode(event.target.value as Periode);
  };

  const handleLivreurChange = (event: React.SyntheticEvent, newValue: Livreur | null) => {
    if (newValue) {
      // Naviguer vers la page individuelle du livreur
      navigate(`/app/rapport/livreur/${newValue.id}`);
    }
  };

  const fetchLivreurs = async () => {
    try {
      setLoadingLivreurs(true);
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.get(`${API_URL}/api/utilisateurs/livreurs`, { headers });

      // Les données de l'API sont déjà en camelCase, pas besoin de mapping
      const livreursMappes = response.data
        .filter((livreur: LivreurAPI) => livreur.id && livreur.nom) // Filtrer les livreurs avec des données valides
        .map((livreur: LivreurAPI) => ({
          id: livreur.id,
          nom: livreur.nom || 'Nom non disponible',
          email: livreur.email || 'Email non disponible',
          telephone: livreur.telephone || 'Téléphone non disponible',
          imagePath: livreur.imagePath,
        }));

      setLivreurs(livreursMappes);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des livreurs:', error);
    } finally {
      setLoadingLivreurs(false);
    }
  };

  const fetchRapportData = async (selectedPeriode: Periode) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Construire les paramètres pour le rapport global (sans livreurId)
      const baseParams = `periode=${selectedPeriode}`;

      // Récupérer toutes les données en parallèle
      const [
        statistiquesGlobales,
        evolutionTemporelle,
        topLivreurs,
        tempsTraitement,
        repartitionStatuts,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/rapport/livreurs-statistiques-globales?${baseParams}`, {
          headers,
        }),
        axios.get(`${API_URL}/api/rapport/livreurs-evolution-temporelle?${baseParams}`, {
          headers,
        }),
        axios.get(`${API_URL}/api/rapport/top-livreurs?${baseParams}&limit=10`, { headers }),
        axios.get(`${API_URL}/api/rapport/livreurs-temps-moyen?${baseParams}`, { headers }),
        axios.get(`${API_URL}/api/rapport/livreurs-repartition-statuts?${baseParams}`, { headers }),
      ]);

      setData({
        statistiquesGlobales: statistiquesGlobales.data,
        evolutionTemporelle: evolutionTemporelle.data,
        topLivreurs: topLivreurs.data,
        tempsTraitement: tempsTraitement.data,
        repartitionStatuts: repartitionStatuts.data,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données du rapport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivreurs();
  }, []);

  useEffect(() => {
    if (periode) {
      fetchRapportData(periode);
    }
  }, [periode]);

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

  const generatePDF = async () => {
    if (!reportRef.current || !data || !periode) return;

    try {
      setIsGeneratingPDF(true);
      await generateLivreurReportPDF(reportRef, periode, getPeriodeLabel);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement du rapport...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }} ref={reportRef}>
      {/* En-tête avec sélecteur de période */}
      <HeaderCard>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                📊 Rapport des Livreurs
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                {`Statistiques et performances détaillées${periode ? ` - ${getPeriodeLabel(periode)}` : ''}`}
              </Typography>
            </Box>

            {/* Bouton de téléchargement plus petit et aligné en haut */}
            <Tooltip
              title={
                isGeneratingPDF ? 'Génération du PDF en cours...' : 'Télécharger le rapport en PDF'
              }
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
                  alignSelf: 'flex-start',
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
            </Tooltip>
          </Box>

          {/* Zone de sélection période et livreur avec espacement maximal */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            px={2}
            className="header-controls"
          >
            {/* Zone de sélection de période */}
            <FormControl
              variant="outlined"
              sx={{
                minWidth: 240,
                ml: '-16px',
                '& .MuiOutlinedInput-root': {
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                  borderRadius: '20px',
                  backdropFilter: 'blur(25px)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  minHeight: '52px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(4, 190, 254, 0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'linear-gradient(135deg, rgba(4, 190, 254, 0.02), rgba(67, 24, 255, 0.02))',
                    borderRadius: '20px',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.6s ease',
                  },
                  '&:hover': {
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                    border: '2px solid rgba(4, 190, 254, 0.3)',
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow:
                      '0 20px 60px rgba(4, 190, 254, 0.2), 0 8px 25px rgba(67, 24, 255, 0.1)',
                    '&::before': {
                      opacity: 1,
                      background:
                        'linear-gradient(135deg, rgba(4, 190, 254, 0.05), rgba(67, 24, 255, 0.05))',
                    },
                  },
                  '&.Mui-focused': {
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                    border: '2px solid rgba(4, 190, 254, 0.5)',
                    boxShadow:
                      '0 20px 60px rgba(4, 190, 254, 0.25), 0 8px 25px rgba(67, 24, 255, 0.15)',
                    transform: 'translateY(-4px)',
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
                  if (!selected) {
                    return (
                      <span
                        style={{
                          color: '#04BEFE',
                          fontWeight: 500,
                        }}
                      >
                        Choisir une période
                      </span>
                    );
                  }
                  const options = {
                    jour: "🌅 Aujourd'hui",
                    semaine: '📅 Cette semaine',
                    mois: '📊 Ce mois',
                    annee: '🗓️ Cette année',
                  };
                  return (
                    <span
                      style={{
                        color: '#4318FF',
                        fontWeight: 500,
                      }}
                    >
                      {options[selected as keyof typeof options]}
                    </span>
                  );
                }}
                sx={{
                  color: '#4318FF',
                  fontWeight: 500,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
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
            {/* Sélection de livreur avec design blanc moderne */}
            <Box
              sx={{
                minWidth: 320,
                position: 'relative',
                mr: '-16px',
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))',
                borderRadius: '20px',
                backdropFilter: 'blur(25px)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
                  borderRadius: '20px',
                  zIndex: -1,
                  opacity: 0,
                  transition: 'opacity 0.6s ease',
                },
                '&:hover': {
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98))',
                  border: '2px solid rgba(67, 24, 255, 0.3)',
                  transform: 'translateY(-6px) scale(1.02)',
                  boxShadow:
                    '0 20px 60px rgba(67, 24, 255, 0.2), 0 8px 25px rgba(4, 190, 254, 0.1)',
                  '&::before': {
                    opacity: 1,
                    background:
                      'linear-gradient(135deg, rgba(67, 24, 255, 0.05), rgba(4, 190, 254, 0.05))',
                  },
                },
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                minHeight: '52px',
                px: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 16px rgba(67, 24, 255, 0.08)',
              }}
              onClick={() => {
                setAutocompleteOpen(true);
              }}
            >
              <GroupIcon
                sx={{
                  color: '#4318FF',
                  mr: 1.5,
                  fontSize: '22px',
                  filter: 'drop-shadow(0 2px 4px rgba(67, 24, 255, 0.2))',
                }}
              />
              <Typography
                sx={{
                  color: '#4318FF',
                  fontSize: '14px',
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                Sélectionner un livreur
              </Typography>
              <KeyboardArrowDownIcon
                sx={{
                  color: '#4318FF',
                  fontSize: '24px',
                  transition: 'transform 0.3s ease',
                  transform: autocompleteOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />

              {loadingLivreurs && (
                <CircularProgress color="inherit" size={20} sx={{ color: 'white', ml: 1 }} />
              )}

              {/* Autocomplete caché pour la fonctionnalité */}
              <Autocomplete
                data-testid="autocomplete-livreur"
                options={livreurs}
                getOptionLabel={(option) => option.nom || 'Nom non disponible'}
                value={null}
                onChange={handleLivreurChange}
                loading={loadingLivreurs}
                open={autocompleteOpen}
                onOpen={() => setAutocompleteOpen(true)}
                onClose={() => setAutocompleteOpen(false)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                  pointerEvents: autocompleteOpen ? 'auto' : 'none',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    '& fieldset': { border: 'none' },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      height: '100%',
                      '& .MuiOutlinedInput-root': {
                        height: '100%',
                        color: 'transparent',
                        '& fieldset': { border: 'none' },
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={option.imagePath ? `${API_URL}${option.imagePath}` : undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      {option.nom ? option.nom.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.nom || 'Nom non disponible'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email || 'Email non disponible'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                clearText="Effacer"
                noOptionsText="Aucun livreur trouvé"
                loadingText="Chargement..."
              />
            </Box>
          </Box>
        </CardContent>
      </HeaderCard>

      {/* Grille des composants */}
      <Grid container spacing={3} className="rapport-content">
        {/* Statistiques globales */}
        <Grid item xs={12}>
          <StyledCard>
            <StatistiquesGlobales data={data?.statistiquesGlobales || null} periode={periode} />
          </StyledCard>
        </Grid>

        {/* Évolution temporelle */}
        <Grid item xs={12}>
          <StyledCard>
            <EvolutionTemporelle data={data?.evolutionTemporelle || null} periode={periode} />
          </StyledCard>
        </Grid>

        {/* Top livreurs */}
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <TopLivreurs
              data={data?.topLivreurs || null}
              periode={periode}
              repartitionData={data?.repartitionStatuts?.repartitionStatuts || []}
            />
          </StyledCard>
        </Grid>
        {/* Répartition des statuts */}
        <Grid item xs={12} lg={6}>
          <StyledCard>
            <RepartitionStatuts data={data?.repartitionStatuts || null} periode={periode} />
          </StyledCard>
        </Grid>

        {/* Temps de traitement */}
        <Grid item xs={12}>
          <StyledCard>
            <TempsTraitement data={data?.tempsTraitement || null} periode={periode} />
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RapportLivreur;
