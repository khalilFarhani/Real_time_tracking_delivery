import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { useTheme } from '@mui/material/styles';
import TempsTraitementChart from './TempsTraitementChart';
import TempsTraitementGaugeChart from './TempsTraitementGaugeChart';
import IconifyIcon from 'components/base/IconifyIcon';
import { SxProps } from '@mui/material';

interface CommandeTempsTraitement {
  commandeId: number;
  tempsTraitement: number; // en heures
  nomLivreur: string;
}

type ChartType = 'triangle' | 'pyramid';

interface TempsTraitementProps {
  sx?: SxProps;
}

const TempsTraitement = ({ sx }: TempsTraitementProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommandeTempsTraitement[]>([]);
  const [chartType, setChartType] = useState<ChartType>('triangle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5283/api/statistiques/temps-traitement');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Préparer les données pour le graphique
  const chartData = {
    ids: data.map((item) => `#${item.commandeId}`),
    temps: data.map((item) => item.tempsTraitement),
    livreurs: data.map((item) => item.nomLivreur),
  };

  // Obtenir le mois actuel en français
  const moisActuel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: ChartType | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Chargement des données...
          </Typography>
        </Stack>
      );
    }

    if (error) {
      return (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Stack>
      );
    }

    if (data.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <Typography variant="body1" color="text.secondary">
            Aucune commande livrée ce mois-ci
          </Typography>
        </Stack>
      );
    }

    switch (chartType) {
      case 'pyramid':
        return <TempsTraitementGaugeChart data={chartData} />;
      case 'triangle':
      default:
        return <TempsTraitementChart data={chartData} />;
    }
  };

  return (
    <Box
      component={Paper}
      p={3}
      sx={{
        height: 350,
        boxShadow: '0 4px 7px rgba(0, 0, 0, 0.05)',
        borderRadius: 5,
        ...sx,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" color="text.primary" fontWeight={700}>
            Temps de Traitement - Commandes Livrées
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {moisActuel.charAt(0).toUpperCase() + moisActuel.slice(1)}
          </Typography>
        </Box>
        <Stack direction="row" sx={{ marginRight: -2 }} spacing={2} alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="type de graphique"
            sx={{
              '& .MuiToggleButton-root': {
                marginTop: -3,
                marginRight: 1,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px !important',
                padding: '6px 10px',
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.info.lighter,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                },
              },
            }}
          >
            <ToggleButton value="triangle" aria-label="graphique en triangles">
              <IconifyIcon
                icon="mdi:chart-timeline-variant"
                fontSize="0.8rem"
                sx={{ color: chartType === 'triangle' ? 'inherit' : theme.palette.text.primary }}
              />
            </ToggleButton>
            <ToggleButton value="pyramid" aria-label="graphique en pyramide">
              <IconifyIcon
                icon="mdi:chart-donut-variant"
                fontSize="0.8rem"
                sx={{ color: chartType === 'pyramid' ? 'inherit' : theme.palette.text.primary }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Box height="calc(100% - 60px)">{renderChart()}</Box>
    </Box>
  );
};

export default TempsTraitement;
