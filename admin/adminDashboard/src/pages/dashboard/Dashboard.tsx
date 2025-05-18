import Grid from '@mui/material/Grid';
import LocationMap from 'components/sections/dashboard/location-map';
import CommandeCalendar from 'components/sections/dashboard/CommandeCalendar';
import Analytics from 'components/sections/dashboard/analytics';
import ProfitChartSection from 'components/sections/dashboard/profit-chart';
import Commandes from 'components/sections/dashboard/Commandes';
import RepartitionFournisseur from 'components/sections/dashboard/RepartitionFournisseur';
import CommandesFournisseurs from 'components/sections/dashboard/commandes-fournisseurs';
import SuiviCommandes from 'components/sections/dashboard/suivi-commandes';
import StatistiqueLivreur from 'components/sections/dashboard/StatistiqueLivreur';
import Livreur from 'components/sections/dashboard/livreur';
import TempsTraitement from 'components/sections/dashboard/temps-traitement';
import AssistantsAdmin from 'components/sections/dashboard/AssistantsAdmin';

const CARD_HEIGHT = 390;

const Dashboard = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Analytics />
      </Grid>
      <Grid item xs={12} md={6}>
        <CommandesFournisseurs sx={{ height: CARD_HEIGHT }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatistiqueLivreur sx={{ height: CARD_HEIGHT }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ProfitChartSection sx={{ height: CARD_HEIGHT }} />
      </Grid>
      {(JSON.parse(localStorage.getItem('user') || '{}').EstAdmin ||
        JSON.parse(localStorage.getItem('user') || '{}').Permissions?.some(
          (p: { permissionName: string }) => p.permissionName === 'Livreur',
        )) && (
        <Grid item xs={12} md={6}>
          <Livreur sx={{ height: CARD_HEIGHT }} />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <SuiviCommandes sx={{ height: CARD_HEIGHT }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <RepartitionFournisseur sx={{ height: CARD_HEIGHT }} />
      </Grid>
      <Grid
        item
        xs={12}
        md={
          !JSON.parse(localStorage.getItem('user') || '{}').EstAdmin &&
          JSON.parse(localStorage.getItem('user') || '{}').Permissions?.some(
            (p: { permissionName: string }) => p.permissionName === 'Livreur',
          )
            ? 12
            : 6
        }
      >
        <CommandeCalendar sx={{ height: CARD_HEIGHT }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <LocationMap sx={{ height: CARD_HEIGHT }} />
      </Grid>

      <Grid item xs={12} md={6}>
        <TempsTraitement sx={{ height: CARD_HEIGHT }} />
      </Grid>
      {JSON.parse(localStorage.getItem('user') || '{}').EstAdmin && (
        <Grid item xs={12} md={6}>
          <AssistantsAdmin sx={{ height: CARD_HEIGHT }} />
        </Grid>
      )}
      <Grid item xs={12} xl={6}>
        <Commandes />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
