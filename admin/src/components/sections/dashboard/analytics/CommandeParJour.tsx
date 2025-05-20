import { useState, useEffect } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface CommandesAujourdhui {
  nombreCommandes: number;
  pourcentageChangement: number;
}

const Tasks = () => {
  const [nombreCommandes, setNombreCommandes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchCommandesAujourdhui = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CommandesAujourdhui>(
          `${API_URL}/api/statistiques/commandes-aujourdhui`,
        );
        setNombreCommandes(response.data.nombreCommandes);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes du jour:', err);
        setNombreCommandes(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandesAujourdhui();
  }, []);

  return (
    <Stack component={Paper} p={2.5} alignItems="center" spacing={2.25} height={100}>
      <Stack
        alignItems="center"
        justifyContent="center"
        height={56}
        width={56}
        borderRadius="50%"
        sx={(theme) => ({
          background: `linear-gradient(90deg, ${theme.palette.gradients.secondary.main} 0%, ${theme.palette.gradients.secondary.state} 100%)`,
        })}
      >
        <IconifyIcon icon="ic:baseline-add-task" fontSize="h3.fontSize" color="info.lighter" />
      </Stack>
      <div>
        <Typography variant="body2" color="text.disabled" noWrap>
          Commandes Aujourd'hui
        </Typography>
        <Stack alignItems="center">
          <Typography mt={0.25} variant="h3">
            {loading ? '...' : nombreCommandes}
          </Typography>
        </Stack>
      </div>
    </Stack>
  );
};

export default Tasks;
