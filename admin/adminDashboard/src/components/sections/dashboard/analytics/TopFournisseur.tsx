import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface TopFournisseur {
  fournisseurId: number;
  nomFournisseur: string;
  nombreCommandes: number;
  montantTotal: number;
}

const TopFournisseur = () => {
  const [topFournisseur, setTopFournisseur] = useState<TopFournisseur | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchTopFournisseur = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<TopFournisseur>(
          `${API_URL}/api/statistiques/top-fournisseur`,
        );

        setTopFournisseur(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération du top fournisseur:', err);
        setError('Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchTopFournisseur();
  }, []);

  // Formater le montant en devise
  const formatMontant = (montant: number) => {
    // Utiliser le formateur de base
    const formatted = new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(montant);

    // Ajouter manuellement le symbole DT
    return `${formatted} DT`;
  };

  return (
    <Stack component={Paper} p={1.5} spacing={1.5} height={100}>
      <div style={{ width: '100%' }}>
        <Typography variant="body2" color="text.disabled" noWrap>
          Top Fournisseur
        </Typography>
        {loading ? (
          <Typography mt={0.25} variant="h3">
            ...
          </Typography>
        ) : error ? (
          <Typography mt={0.25} variant="body2" color="error.main">
            {error}
          </Typography>
        ) : (
          <>
            <Typography mt={0.25} variant="h3" noWrap sx={{ maxWidth: '100%' }}>
              {topFournisseur?.nomFournisseur || 'Aucun'}
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.5}>
              <Typography variant="caption" fontWeight="bold" color="success.main">
                {topFournisseur ? formatMontant(topFournisseur.montantTotal) : '0 DT'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topFournisseur?.nombreCommandes || 0} commandes
              </Typography>
            </Stack>
          </>
        )}
      </div>
    </Stack>
  );
};

export default TopFournisseur;
