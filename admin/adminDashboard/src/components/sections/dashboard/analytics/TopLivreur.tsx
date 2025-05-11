import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import LinearProgress from '@mui/material/LinearProgress';

interface TopLivreur {
  livreurId: number;
  nomLivreur: string;
  nombreCommandesLivrees: number;
  nombreCommandesTotal: number;
  pourcentageLivraison: number;
  montantTotal: number; // Ajout du montant total
}

const TopLivreur = () => {
  const [topLivreur, setTopLivreur] = useState<TopLivreur | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchTopLivreur = async () => {
      try {
        setLoading(true);
        const response = await axios.get<TopLivreur>(`${API_URL}/api/statistiques/top-livreur`);
        setTopLivreur(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du top livreur:', err);
        setTopLivreur(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTopLivreur();
  }, []);

  // Formater le montant en dinar tunisien
  const formatDinar = (montant: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(montant);
  };

  return (
    <Stack component={Paper} p={2.5} alignItems="center" spacing={2.25} height={100}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height={56}
        width={72}
        sx={(theme) => ({
          background: `linear-gradient(90deg, ${theme.palette.gradients.secondary.main} 0%, ${theme.palette.gradients.secondary.state} 100%)`,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        })}
        borderRadius="50%"
      >
        <IconifyIcon icon="mdi:trophy-award" fontSize="h3.fontSize" color="info.lighter" />
      </Stack>
      <div style={{ width: '100%' }}>
        <Typography variant="body2" color="text.disabled" noWrap>
          Top Livreur
        </Typography>
        {loading ? (
          <Typography mt={0.25} variant="h3">
            ...
          </Typography>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography mt={0.25} variant="h3" noWrap sx={{ maxWidth: '60%' }}>
                {topLivreur?.nomLivreur || 'Aucun'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {topLivreur?.pourcentageLivraison || 0}%
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                {topLivreur?.nombreCommandesLivrees || 0}/{topLivreur?.nombreCommandesTotal || 0}{' '}
                livraisons
              </Typography>
              {topLivreur?.montantTotal && (
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  {formatDinar(topLivreur.montantTotal)}
                </Typography>
              )}
            </Stack>
            <LinearProgress
              variant="determinate"
              value={topLivreur?.pourcentageLivraison || 0}
              sx={{
                mt: 0.5,
                height: 6,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'success.main',
                },
              }}
            />
          </>
        )}
      </div>
    </Stack>
  );
};

export default TopLivreur;
