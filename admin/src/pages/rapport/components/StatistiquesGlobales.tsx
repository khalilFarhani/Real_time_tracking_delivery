import { CardContent, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  LocalShipping,
  Assignment,
  AttachMoney,
  CheckCircle,
} from '@mui/icons-material';

const StatCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '28px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
  backdropFilter: 'blur(30px)',

  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03), rgba(118, 75, 162, 0.03))',
    borderRadius: '28px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },

  '&:hover': {
    transform: 'translateY(-16px) scale(1.03)',
    boxShadow: '0 30px 60px rgba(102, 126, 234, 0.25), 0 10px 20px rgba(118, 75, 162, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
    },
  },
}));

const IconWrapper = styled(Box)<{ iconColor?: string }>(({ theme, iconColor }) => ({
  width: 90,
  height: 90,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6))',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-3px',
    borderRadius: '50%',
    background: iconColor
      ? `linear-gradient(135deg, ${iconColor}, ${iconColor}88, ${iconColor}66, ${iconColor}44)`
      : 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.5s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '2px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
    zIndex: -1,
  },
  '&:hover': {
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow: iconColor
      ? `0 15px 45px ${iconColor}30, inset 0 2px 8px rgba(255, 255, 255, 0.9)`
      : '0 15px 45px rgba(102, 126, 234, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.9)',
    '&::before': {
      opacity: 1,
    },
  },
}));

interface StatistiquesGlobalesData {
  totalLivreurs: number;
  livreursActifs: number;
  totalCommandesPeriode: number;
  commandesLivreesPeriode: number;
  revenusTotalPeriode: number;
  tauxLivraisonGlobal: number;
  revenuMoyenParCommande: number;
}

interface StatistiquesGlobalesProps {
  data: StatistiquesGlobalesData | null;
  periode: string;
}

const StatistiquesGlobales = ({ data, periode }: StatistiquesGlobalesProps) => {
  if (!data) {
    return (
      <CardContent>
        <Typography variant="h6">Chargement des statistiques globales...</Typography>
      </CardContent>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getPeriodeLabel = (periode: string) => {
    switch (periode) {
      case 'jour':
        return "aujourd'hui";
      case 'semaine':
        return 'cette semaine';
      case 'mois':
        return 'ce mois';
      case 'annee':
        return 'cette année';
      default:
        return 'cette période';
    }
  };

  const stats = [
    {
      title: 'Total Livreurs',
      value: formatNumber(data.totalLivreurs),
      subtitle: 'Livreurs enregistrés',
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      color: '#667eea', // Modern purple
      bgColor: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))',
    },
    {
      title: 'Livreurs Actifs',
      value: formatNumber(data.livreursActifs),
      subtitle: 'Avec commandes en transit',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: '#10b981', // Emerald green
      bgColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
    },
    {
      title: 'Commandes Totales',
      value: formatNumber(data.totalCommandesPeriode),
      subtitle: `Commandes ${getPeriodeLabel(periode)}`,
      icon: <Assignment sx={{ fontSize: 32 }} />,
      color: '#3b82f6', // Bright blue
      bgColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
    },
    {
      title: 'Commandes Livrées',
      value: formatNumber(data.commandesLivreesPeriode),
      subtitle: `Livrées ${getPeriodeLabel(periode)}`,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: '#06b6d4', // Cyan
      bgColor: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(8, 145, 178, 0.1))',
    },
    {
      title: 'Revenus Totaux',
      value: formatCurrency(data.revenusTotalPeriode),
      subtitle: `Revenus ${getPeriodeLabel(periode)}`,
      icon: <AttachMoney sx={{ fontSize: 32 }} />,
      color: '#f59e0b', // Amber
      bgColor: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))',
    },
    {
      title: 'Taux de Livraison',
      value: `${data.tauxLivraisonGlobal}%`,
      subtitle: 'Taux global',
      icon:
        data.tauxLivraisonGlobal >= 80 ? (
          <TrendingUp sx={{ fontSize: 32 }} />
        ) : (
          <TrendingDown sx={{ fontSize: 32 }} />
        ),
      color: data.tauxLivraisonGlobal >= 80 ? '#10b981' : '#ef4444', // Emerald or Red
      bgColor:
        data.tauxLivraisonGlobal >= 80
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
    },
  ];

  return (
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(67, 24, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '24px' }}>📈</Typography>
          </Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Statistiques Globales
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'rgba(67, 24, 255, 0.1)',
            borderRadius: '20px',
            px: 2,
            py: 1,
            border: '2px solid rgba(67, 24, 255, 0.2)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#4318FF',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            📅 {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard>
              <IconWrapper iconColor={stat.color} sx={{ background: stat.bgColor }}>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </IconWrapper>

              <Typography
                variant="h4"
                component="div"
                fontWeight="bold"
                color={stat.color}
                gutterBottom
              >
                {stat.value}
              </Typography>

              <Typography variant="h6" component="div" fontWeight="medium" gutterBottom>
                {stat.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {stat.subtitle}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Métriques supplémentaires */}
      <Box
        mt={4}
        p={4}
        sx={{
          background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.05), rgba(4, 190, 254, 0.05))',
          borderRadius: '20px',
          border: '2px solid rgba(67, 24, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #4318FF, #04BEFE)',
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(67, 24, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '18px' }}>📊</Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#4318FF',
            }}
          >
            Métriques Clés
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(data.revenuMoyenParCommande)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenu moyen par commande
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="secondary">
                {data.totalLivreurs > 0
                  ? Math.round(data.totalCommandesPeriode / data.totalLivreurs)
                  : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Commandes par livreur
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {data.livreursActifs > 0
                  ? Math.round((data.livreursActifs / data.totalLivreurs) * 100)
                  : 0}
                %
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taux d'activité des livreurs
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {data.livreursActifs > 0
                  ? Math.round(data.commandesLivreesPeriode / data.livreursActifs)
                  : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Livraisons par livreur actif
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </CardContent>
  );
};

export default StatistiquesGlobales;
