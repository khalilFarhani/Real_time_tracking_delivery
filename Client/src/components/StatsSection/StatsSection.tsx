import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import './StatsSection.css';

const StatsSection: React.FC = () => {
  const stats = [
    {
      title: 'Livraisons réussies',
      value: '12,847',
      icon: <CheckCircleIcon />,
      color: 'var(--accent-color)',
      bgColor: 'var(--accent-light)',
      trend: '+12%'
    },
    {
      title: 'Colis en transit',
      value: '1,234',
      icon: <DeliveryIcon />,
      color: 'var(--accent-color)',
      bgColor: 'var(--accent-light)',
      trend: '+5%'
    },
    {
      title: 'Temps moyen',
      value: '2.4h',
      icon: <ScheduleIcon />,
      color: 'var(--accent-color)',
      bgColor: 'var(--accent-light)',
      trend: '-8%'
    },
    {
      title: 'Clients satisfaits',
      value: '98.5%',
      icon: <StarIcon />,
      color: 'var(--accent-color)',
      bgColor: 'var(--accent-light)',
      trend: '+2%'
    }
  ];

  return (
    <Box sx={{ py: 6, bgcolor: 'var(--gray-50)' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'var(--gradient-primary)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Nos Performances en Temps Réel
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Découvrez nos statistiques de livraison actualisées
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                className="stats-card"
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  border: `1px solid ${stat.bgColor}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 8px 25px ${stat.color}20`
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: stat.bgColor,
                        color: stat.color,
                        mr: 2
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon
                        sx={{
                          fontSize: 16,
                          color: stat.trend.startsWith('+') ? 'var(--secondary-color)' : 'var(--red-color)'
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: stat.trend.startsWith('+') ? 'var(--secondary-color)' : 'var(--red-color)',
                          fontWeight: 600
                        }}
                      >
                        {stat.trend}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section supplémentaire avec informations globales */}
        <Box sx={{ mt: 5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  50,000+
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Clients nous font confiance
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--accent-color) 0%, #f59e0b 100%)',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <DeliveryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  24/7
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Service de livraison
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsSection;
