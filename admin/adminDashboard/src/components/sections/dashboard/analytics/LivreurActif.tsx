import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

// Interface pour les livreurs actifs
interface LivreurActif {
  id: number;
  nom: string;
}

const LivreurActif = () => {
  const [livreursActifs, setLivreursActifs] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchLivreursActifs = async () => {
      try {
        setLoading(true);
        // Utiliser l'endpoint qui compte les livreurs uniques avec commandes en transit
        const response = await axios.get<LivreurActif[]>(
          `${API_URL}/api/statistiques/livreurs-actifs`,
        );

        // Définir le nombre de livreurs actifs (nombre d'éléments dans le tableau)
        setLivreursActifs(response.data.length);
      } catch (err) {
        console.error('Erreur lors de la récupération des livreurs actifs:', err);
        setLivreursActifs(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLivreursActifs();
  }, []);

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
        <IconifyIcon icon="mdi:account-clock" fontSize="h2.fontSize" color="primary.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled">
          Livreurs Actifs
        </Typography>
        <Typography mt={0.25} variant="h3">
          {loading ? '...' : livreursActifs}
        </Typography>
      </div>
    </Stack>
  );
};

export default LivreurActif;
