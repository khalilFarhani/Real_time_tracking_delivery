import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import CommandesFournisseursChart from './CommandesFournisseursChart';
import { SxProps } from '@mui/material';

interface DonneesMensuelles {
  mois: string;
  nombreCommandes: number;
  nombreFournisseurs: number;
}

interface StatistiquesData {
  donneesMensuelles: DonneesMensuelles[];
  totalCommandes: number;
  totalFournisseurs: number;
  pourcentageChangement: number;
  pourcentageChangementFournisseurs?: number;
}

interface CommandesFournisseursProps {
  sx?: SxProps;
}

const CommandesFournisseurs = ({ sx }: CommandesFournisseursProps) => {
  const [data, setData] = useState<StatistiquesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:5283';

  // Fonction pour normaliser les pourcentages (limiter à ±100%)
  const normaliserPourcentage = (pourcentage: number): number => {
    // Limiter à ±100%
    const valeurLimitee = Math.max(Math.min(pourcentage, 100), -100);
    // Arrondir à 1 décimale
    return Math.round(valeurLimitee * 10) / 10;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données de base
        const response = await axios.get(
          `${API_URL}/api/statistiques/commandes-fournisseurs-mensuels`,
        );

        // Calculer le pourcentage de changement pour les fournisseurs
        let pourcentageChangementFournisseurs = 0;
        const donneesMensuelles = response.data.donneesMensuelles;

        if (donneesMensuelles && donneesMensuelles.length >= 2) {
          const moisActuel = donneesMensuelles[donneesMensuelles.length - 1];
          const moisPrecedent = donneesMensuelles[donneesMensuelles.length - 2];

          if (moisPrecedent.nombreFournisseurs > 0) {
            pourcentageChangementFournisseurs =
              ((moisActuel.nombreFournisseurs - moisPrecedent.nombreFournisseurs) /
                moisPrecedent.nombreFournisseurs) *
              100;
          }
        }

        // Normaliser les pourcentages
        const pourcentageCommandesNormalise = normaliserPourcentage(
          response.data.pourcentageChangementCommandes,
        );
        const pourcentageFournisseursNormalise = normaliserPourcentage(
          pourcentageChangementFournisseurs,
        );

        // Ajouter les pourcentages normalisés aux données
        const dataWithNormalizedPercentages = {
          ...response.data,
          pourcentageChangement: pourcentageCommandesNormalise,
          pourcentageChangementFournisseurs: pourcentageFournisseursNormalise,
        };

        setData(dataWithNormalizedPercentages);
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
  const chartData = data?.donneesMensuelles
    ? {
        labels: data.donneesMensuelles.map((item) => item.mois),
        commandes: data.donneesMensuelles.map((item) => item.nombreCommandes),
        fournisseurs: data.donneesMensuelles.map((item) => item.nombreFournisseurs),
      }
    : { labels: [], commandes: [], fournisseurs: [] };

  return (
    <Box component={Paper} height={{ xs: 450, sm: 350 }} p={3} sx={{ ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
          {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
        </Typography>
        <IconifyIcon icon="ic:round-bar-chart" color="primary.main" fontSize={24} />
      </Stack>

      <Stack direction="row" spacing={3} height="calc(100% - 60px)">
        {/* Colonne de gauche - Informations textuelles */}
        <Stack width="30%" justifyContent="space-between">
          <Box>
            <Typography
              variant="h2"
              color="text.primary"
              fontWeight={600}
              sx={{ fontSize: '3rem', mb: 0 }}
            >
              {loading ? '...' : data?.totalCommandes || 0}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                Commandes
              </Typography>
              {data && (
                <Stack direction="row" alignItems="center" sx={{ mt: -6 }}>
                  <IconifyIcon
                    icon="mdi:triangle"
                    color={data.pourcentageChangement >= 0 ? 'success.main' : 'error.main'}
                    fontSize="small"
                    sx={{
                      transform:
                        data.pourcentageChangement >= 0 ? 'rotate(0deg)' : 'rotate(180deg)',
                      fontSize: '0.8rem',
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={data.pourcentageChangement >= 0 ? 'success.main' : 'error.main'}
                    fontWeight={600}
                  >
                    {Math.abs(data.pourcentageChangement)}%
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h3"
                color="text.primary"
                fontWeight={600}
                sx={{ fontSize: '2rem', mb: 0 }}
              >
                {loading ? '...' : data?.totalFournisseurs || 0}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  Fournisseurs
                </Typography>
                {data && data.pourcentageChangementFournisseurs !== undefined && (
                  <Stack direction="row" alignItems="center" sx={{ mt: -6 }}>
                    <IconifyIcon
                      icon="mdi:triangle"
                      color={
                        data.pourcentageChangementFournisseurs >= 0 ? 'success.main' : 'error.main'
                      }
                      fontSize="small"
                      sx={{
                        transform:
                          data.pourcentageChangementFournisseurs >= 0
                            ? 'rotate(0deg)'
                            : 'rotate(180deg)',
                        fontSize: '0.8rem',
                        mr: 0.5,
                      }}
                    />
                    <Typography
                      variant="caption"
                      color={
                        data.pourcentageChangementFournisseurs >= 0 ? 'success.main' : 'error.main'
                      }
                      fontWeight={600}
                    >
                      {Math.abs(data.pourcentageChangementFournisseurs)}%
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <IconifyIcon
                  icon="mdi:check-circle"
                  color="success.main"
                  sx={{ fontSize: '1.5rem' }}
                />
                <Typography variant="body1" color="success.main" fontWeight={600}>
                  En bonne voie
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>

        {/* Colonne de droite - Graphique */}
        <Box sx={{ width: '60%', height: '100%' }}>
          {loading ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <Typography>Chargement...</Typography>
            </Box>
          ) : error ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <CommandesFournisseursChart data={chartData} sx={{ width: '100%', height: '100%' }} />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default CommandesFournisseurs;
