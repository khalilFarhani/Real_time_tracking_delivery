import Grid from '@mui/material/Grid';
import Calendar from 'components/sections/dashboard/calendar';
import CommandeCalendar from 'components/sections/dashboard/CommandeCalendar';
import Analytics from 'components/sections/dashboard/analytics';
import Revenu from 'components/sections/dashboard/card-security';
import ComplexTable from 'components/sections/dashboard/complex-table';
import SupplierDistributionChart from 'components/sections/dashboard/DistributionChart/SupplierDistributionChart';
import CommandesFournisseurs from 'components/sections/dashboard/commandes-fournisseurs';
import SuiviCommandes from 'components/sections/dashboard/suivi-commandes';
import StatistiqueLivreur from 'components/sections/dashboard/StatistiqueLivreur';
import Tasks from 'components/sections/dashboard/tasks';
import TeamMembers from 'components/sections/dashboard/team-members';
import Livreur from 'components/sections/dashboard/livreur';
import BusinessDesign from 'components/sections/dashboard/business-design';

const Dashboard = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Analytics />
      </Grid>
      <Grid item xs={12} md={6}>
        <CommandesFournisseurs />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatistiqueLivreur />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <Revenu />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <Tasks />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <SuiviCommandes />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <SupplierDistributionChart />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <Livreur />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <Calendar />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <CommandeCalendar />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <BusinessDesign />
      </Grid>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <TeamMembers />
      </Grid>
      <Grid item xs={12} lg={8} xl={6}>
        <ComplexTable />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
