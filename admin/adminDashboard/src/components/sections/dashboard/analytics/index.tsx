import Grid from '@mui/material/Grid';
import LivreurActif from './LivreurActif';
import LivreurDisponible from './LivreurDisponible';
import Sales from './TopFournisseur';
import Revenu from './Revenu';
import Tasks from './CommandeParJour';
import TopLivreur from './TopLivreur';

const Analytics = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6} md={4} xl={2}>
        <LivreurActif />
      </Grid>

      <Grid item xs={12} sm={6} md={4} xl={2}>
        <Revenu />
      </Grid>

      <Grid item xs={12} sm={6} md={4} xl={2}>
        <Sales />
      </Grid>
      <Grid item xs={12} sm={6} md={4} xl={2}>
        <LivreurDisponible />
      </Grid>
      <Grid item xs={12} sm={6} md={4} xl={2}>
        <Tasks />
      </Grid>

      <Grid item xs={12} sm={6} md={4} xl={2}>
        <TopLivreur />
      </Grid>
    </Grid>
  );
};

export default Analytics;
