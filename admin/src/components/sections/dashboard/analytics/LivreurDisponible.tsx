import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

// Interface pour les livreurs disponibles
interface LivreurDisponible {
  nombreLivreursDisponibles: number;
}

const LivreurDisponible = () => {
  const [livreursDisponibles, setLivreursDisponibles] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchLivreursDisponibles = async () => {
      try {
        setLoading(true);
        // Utiliser l'endpoint qui compte les livreurs sans commandes
        const response = await axios.get<LivreurDisponible>(
          `${API_URL}/api/statistiques/livreurs-disponibles`,
        );

        // Définir le nombre de livreurs disponibles
        setLivreursDisponibles(response.data.nombreLivreursDisponibles);
      } catch (err) {
        console.error('Erreur lors de la récupération des livreurs disponibles:', err);
        setLivreursDisponibles(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLivreursDisponibles();
  }, []);

  return (
    <Stack component={Paper} p={2.5} alignItems="center" spacing={2.25} height={100}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height={56}
        width={56}
        bgcolor="info.lighter"
        borderRadius="50%"
      >
        <IconifyIcon icon="mdi:account-group" fontSize="h2.fontSize" color="success.main" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled">
          Livreurs Disponibles
        </Typography>
        <Typography mt={0.25} variant="h3">
          {loading ? '...' : livreursDisponibles}
        </Typography>
      </div>
    </Stack>
  );
};

export default LivreurDisponible;
