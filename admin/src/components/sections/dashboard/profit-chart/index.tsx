import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import ProfitChart from './ProfitChart';
import { SxProps } from '@mui/material';

type Periode = 'semaine' | 'mois' | 'annee';

interface ProfitData {
  profitTotal: number;
  pourcentageChangement: number;
  donneesPeriode: Array<{
    jour?: string;
    mois?: string;
    annee?: string;
    date: string;
    profit: number;
  }>;
  periode: Periode;
}

interface ProfitChartSectionProps {
  sx?: SxProps;
}

const ProfitChartSection = ({ sx }: ProfitChartSectionProps) => {
  const [periode, setPeriode] = useState<Periode>('semaine');
  const [data, setData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/api/statistiques/profits?periode=${periode}`);
        setData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des profits:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  // Préparer les données pour le graphique
  const chartData = data?.donneesPeriode
    ? {
        labels: data.donneesPeriode.map((item) => item.jour || item.mois || item.annee || ''),
        profits: data.donneesPeriode.map((item) => item.profit),
      }
    : { labels: [], profits: [] };

  return (
    <Box component={Paper} sx={{ p: 3, ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="text.primary">
          Profits
        </Typography>
        <ButtonGroup variant="outlined" size="small">
          {['semaine', 'mois', 'annee'].map((p) => (
            <Button
              key={p}
              onClick={() => setPeriode(p as Periode)}
              sx={{
                ...(periode === p
                  ? {
                      bgcolor: 'secondary.main', // Bleu ciel
                      borderColor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                        borderColor: 'secondary.dark',
                      },
                    }
                  : {
                      color: 'secondary.main', // Bleu ciel
                      borderColor: 'secondary.main',
                      '&:hover': {
                        bgcolor: 'secondary.light',
                        borderColor: 'secondary.main',
                      },
                    }),
              }}
            >
              {p === 'semaine' ? 'Semaine' : p === 'mois' ? 'Mois' : 'Année'}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      <Stack direction="row" spacing={3} height="calc(100% - 60px)">
        {/* Graphique sur toute la largeur */}
        <Box width="100%" height="100%">
          {loading ? (
            <Stack alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body1" color="text.secondary">
                Chargement des données...
              </Typography>
            </Stack>
          ) : error ? (
            <Stack alignItems="center" justifyContent="center" height="100%">
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </Stack>
          ) : (
            <ProfitChart data={chartData} periode={periode} />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default ProfitChartSection;
