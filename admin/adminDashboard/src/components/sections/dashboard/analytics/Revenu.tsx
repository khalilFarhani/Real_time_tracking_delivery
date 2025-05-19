import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface RevenusMois {
  revenusMois: number;
  pourcentageChangement: number;
}

const Revenu = () => {
  const [revenusMois, setRevenusMois] = useState<number>(0);
  const [pourcentageChangement, setPourcentageChangement] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchRevenusMois = async () => {
      try {
        setLoading(true);
        const response = await axios.get<RevenusMois>(`${API_URL}/api/statistiques/revenus-mois`);
        setRevenusMois(response.data.revenusMois);
        setPourcentageChangement(response.data.pourcentageChangement);
      } catch (err) {
        console.error('Erreur lors de la récupération des revenus du mois:', err);
        setRevenusMois(0);
        setPourcentageChangement(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenusMois();
  }, []);

  // Fonction pour formater le montant en devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(amount);
  };

  return (
    <Stack component={Paper} p={2.5} alignItems="center" spacing={2.25} height={100}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height={56}
        width={56}
        bgcolor="info.main"
        borderRadius="50%"
      >
        <IconifyIcon icon="ic:round-attach-money" fontSize="h2.fontSize" color="primary.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled" noWrap>
          Revenus du Mois
        </Typography>
        <Stack alignItems="center">
          <Typography mt={0.25} variant="h3">
            {loading ? '...' : formatCurrency(revenusMois)}
          </Typography>
        </Stack>
        {!loading && (
          <Typography
            variant="caption"
            color={pourcentageChangement >= 0 ? 'success.main' : 'error.main'}
            fontWeight={700}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <IconifyIcon
              icon={
                pourcentageChangement >= 0
                  ? 'ic:baseline-arrow-drop-up'
                  : 'ic:baseline-arrow-drop-down'
              }
              fontSize="h6.fontSize"
            />
            {Math.abs(pourcentageChangement)}%
          </Typography>
        )}
      </div>
    </Stack>
  );
};

export default Revenu;
