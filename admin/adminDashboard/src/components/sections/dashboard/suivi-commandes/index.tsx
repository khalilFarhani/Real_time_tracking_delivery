import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import SuiviCommandesChart from './SuiviCommandesChart';

interface StatutCommande {
  statut: string;
  nombre: number;
}

interface TotalCommandes {
  total: number;
  enCours: number;
  pourcentageChangement: number;
}

const SuiviCommandes = () => {
  const [statutsCommandes, setStatutsCommandes] = useState<StatutCommande[]>([]);
  const [totalCommandes, setTotalCommandes] = useState<TotalCommandes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statutsResponse, totalResponse] = await Promise.all([
          axios.get(`${API_URL}/api/statistiques/commandes-par-statut`),
          axios.get(`${API_URL}/api/statistiques/total-commandes`),
        ]);

        setStatutsCommandes(statutsResponse.data);
        setTotalCommandes(totalResponse.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Préparer les données pour le graphique
  const chartData = statutsCommandes.map((item) => item.nombre);
  const chartLabels = statutsCommandes.map((item) => item.statut);

  return (
    <Paper sx={{ height: 350 }}>
      <Stack alignItems="flex-start" justifyContent="space-between">
        <div>
          <Typography variant="body2" color="text.disabled" fontWeight={500}>
            Suivi des Commandes
          </Typography>
          <Typography mt={0.5} variant="h2">
            {loading ? '...' : totalCommandes?.enCours || 0}{' '}
            <Typography component="span" variant="body2" color="text.disabled" fontWeight={500}>
              En cours
            </Typography>
          </Typography>
        </div>
        {totalCommandes && (
          <Stack alignItems="center" spacing={0.25}>
            <IconifyIcon
              icon={
                totalCommandes.pourcentageChangement >= 0
                  ? 'ic:baseline-arrow-drop-up'
                  : 'ic:baseline-arrow-drop-down'
              }
              color={totalCommandes.pourcentageChangement >= 0 ? 'success.main' : 'error.main'}
              fontSize="h6.fontSize"
            />
            <Typography
              variant="body2"
              color={totalCommandes.pourcentageChangement >= 0 ? 'success.main' : 'error.main'}
              fontWeight={700}
            >
              {totalCommandes.pourcentageChangement >= 0 ? '+' : ''}
              {totalCommandes.pourcentageChangement}%
            </Typography>
          </Stack>
        )}
      </Stack>

      {loading ? (
        <Typography variant="body1" sx={{ mt: 5, textAlign: 'center' }}>
          Chargement des données...
        </Typography>
      ) : error ? (
        <Typography variant="body1" color="error" sx={{ mt: 5, textAlign: 'center' }}>
          {error}
        </Typography>
      ) : (
        <SuiviCommandesChart
          data={chartData}
          labels={chartLabels}
          sx={{ height: '230px !important' }}
        />
      )}
    </Paper>
  );
};

export default SuiviCommandes;
