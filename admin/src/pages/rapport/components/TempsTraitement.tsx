import { CardContent, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

// Styled components pour un design moderne
const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: '28px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(30px)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(67, 24, 255, 0.06)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4318FF, #04BEFE, #667eea, #764ba2)',
    backgroundSize: '300% 100%',
    animation: 'shimmer 4s infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '28px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 25px 80px rgba(67, 24, 255, 0.12), 0 10px 30px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::after': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-300% 0' },
    '100%': { backgroundPosition: '300% 0' },
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(5),
  padding: theme.spacing(4),
  borderRadius: '28px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(67, 24, 255, 0.06)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '28px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 25px 80px rgba(67, 24, 255, 0.12), 0 10px 30px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(67, 24, 255, 0.06)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '24px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(67, 24, 255, 0.1), transparent)',
    transition: 'left 0.8s ease',
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.03)',
    boxShadow: '0 25px 60px rgba(67, 24, 255, 0.15), 0 10px 30px rgba(4, 190, 254, 0.1)',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
    '&::after': {
      left: '100%',
    },
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 420,
  padding: theme.spacing(4),
  borderRadius: '28px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(67, 24, 255, 0.06)',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #05CD99, #FFCE20, #EE5D50, #4318FF)',
    backgroundSize: '300% 100%',
    animation: 'shimmer 4s infinite',
    opacity: 0.9,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '28px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 25px 80px rgba(67, 24, 255, 0.12), 0 10px 30px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::after': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-300% 0' },
    '100%': { backgroundPosition: '300% 0' },
  },
}));

const AnalysisContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.08), rgba(118, 75, 162, 0.05))',
  border: '2px solid rgba(67, 24, 255, 0.15)',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4318FF, #667eea)',
    opacity: 0.9,
  },
}));

const PeriodChip = styled(Chip)(() => ({
  background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.15), rgba(118, 75, 162, 0.1))',
  border: '2px solid rgba(67, 24, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  color: '#4318FF',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  '& .MuiChip-label': {
    padding: '8px 16px',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.2), rgba(118, 75, 162, 0.15))',
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease',
}));

interface TempsTraitementData {
  livreursTempsTraitement: Array<{
    livreurId: number;
    nomLivreur: string;
    nombreCommandesLivrees: number;
    tempsMoyenHeures: number;
    tempsMinHeures: number;
    tempsMaxHeures: number;
  }>;
}

interface TempsTraitementProps {
  data: TempsTraitementData | null;
  periode: string;
}

const TempsTraitement = ({ data, periode }: TempsTraitementProps) => {
  if (!data || !data.livreursTempsTraitement) {
    return (
      <CardContent>
        <Typography variant="h6">Chargement des temps de traitement...</Typography>
      </CardContent>
    );
  }

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

  const livreursData = data.livreursTempsTraitement || [];

  if (livreursData.length === 0) {
    return (
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold" color="primary">
            ⏱️ Temps de Traitement
          </Typography>
          <Chip label={getPeriodeLabel(periode)} color="primary" variant="outlined" size="small" />
        </Box>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Aucune donnée de temps de traitement disponible {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      </CardContent>
    );
  }

  // Préparer les données pour le graphique
  const categories = livreursData.map((item) => item.nomLivreur);
  const tempsMoyen = livreursData.map((item) => Math.round(item.tempsMoyenHeures * 10) / 10);
  const tempsMin = livreursData.map((item) => Math.round(item.tempsMinHeures * 10) / 10);
  const tempsMax = livreursData.map((item) => Math.round(item.tempsMaxHeures * 10) / 10);

  // Calculer les statistiques globales
  const tempsMoyenGlobal =
    livreursData.length > 0
      ? Math.round(
          (livreursData.reduce((sum: number, item) => sum + item.tempsMoyenHeures, 0) /
            livreursData.length) *
            10,
        ) / 10
      : 0;

  const tempsMinGlobal =
    livreursData.length > 0 ? Math.min(...livreursData.map((item) => item.tempsMinHeures)) : 0;

  const tempsMaxGlobal =
    livreursData.length > 0 ? Math.max(...livreursData.map((item) => item.tempsMaxHeures)) : 0;

  const totalCommandesLivrees = livreursData.reduce(
    (sum: number, item) => sum + item.nombreCommandesLivrees,
    0,
  );

  // Configuration du graphique moderne avec courbes spectaculaires
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: 'rgba(67, 24, 255, 0.4)',
          width: 2,
        },
        lineStyle: {
          color: 'rgba(67, 24, 255, 0.6)',
          width: 2,
          type: 'dashed',
        },
      },
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'rgba(67, 24, 255, 0.3)',
      borderWidth: 2,
      borderRadius: 16,
      padding: [16, 20],
      textStyle: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: 600,
      },
      formatter: function (
        params: Array<{ axisValue: string; seriesName: string; value: number; color: string }>,
      ) {
        let result = `<div style="font-weight: 800; margin-bottom: 12px; color: #4318FF; font-size: 15px;">${params[0].axisValue}</div>`;
        params.forEach(
          (param: { axisValue: string; seriesName: string; value: number; color: string }) => {
            const color = param.color;
            const icon =
              param.seriesName === 'Temps Minimum'
                ? '⚡'
                : param.seriesName === 'Temps Moyen'
                  ? '📊'
                  : '🔥';
            result += `<div style="display: flex; align-items: center; margin: 6px 0; padding: 4px 0;">
            <span style="margin-right: 10px; font-size: 16px;">${icon}</span>
            <span style="display: inline-block; width: 14px; height: 14px; background: ${color}; border-radius: 50%; margin-right: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
            <span style="font-weight: 700; color: #374151;">${param.seriesName}:</span>
            <span style="margin-left: 10px; font-weight: 800; color: ${color}; font-size: 15px;">${param.value}h</span>
          </div>`;
          },
        );
        return result;
      },
      extraCssText: 'box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15); backdrop-filter: blur(10px);',
    },
    legend: {
      data: [
        {
          name: 'Temps Minimum',
          icon: 'circle',
          textStyle: {
            color: '#05CD99',
            fontWeight: 700,
            fontSize: 13,
          },
        },
        {
          name: 'Temps Moyen',
          icon: 'circle',
          textStyle: {
            color: '#FFCE20',
            fontWeight: 700,
            fontSize: 13,
          },
        },
        {
          name: 'Temps Maximum',
          icon: 'circle',
          textStyle: {
            color: '#EE5D50',
            fontWeight: 700,
            fontSize: 13,
          },
        },
      ],
      top: 20,
      left: 'center',
      itemGap: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 25,
      padding: [12, 25],
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 2,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowBlur: 10,
      shadowOffsetY: 4,
    },
    grid: {
      left: '6%',
      right: '6%',
      bottom: '12%',
      top: '25%',
      containLabel: true,
      backgroundColor: 'transparent',
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.4)',
          width: 2,
        },
        length: 8,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.3)',
          width: 3,
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 700,
        margin: 15,
        rotate: 0,
        formatter: function (value: string) {
          return value.length > 10 ? value.substring(0, 10) + '...' : value;
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}h',
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 700,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.3)',
          width: 3,
        },
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.4)',
          width: 2,
        },
        length: 6,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(107, 114, 128, 0.15)',
          width: 1,
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Temps Minimum',
        type: 'bar',
        data: tempsMin,
        barWidth: '22%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#05CD99' },
              { offset: 0.3, color: '#10b981' },
              { offset: 0.7, color: '#059669' },
              { offset: 1, color: '#047857' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
          shadowColor: 'rgba(5, 205, 153, 0.4)',
          shadowBlur: 15,
          shadowOffsetY: 6,
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(5, 205, 153, 0.6)',
            shadowBlur: 20,
            shadowOffsetY: 8,
            borderColor: '#05CD99',
            borderWidth: 3,
          },
        },
        animationDelay: function (idx: number) {
          return idx * 150;
        },
      },
      {
        name: 'Temps Moyen',
        type: 'bar',
        data: tempsMoyen,
        barWidth: '22%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#FFCE20' },
              { offset: 0.3, color: '#fbbf24' },
              { offset: 0.7, color: '#f59e0b' },
              { offset: 1, color: '#d97706' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
          shadowColor: 'rgba(255, 206, 32, 0.4)',
          shadowBlur: 15,
          shadowOffsetY: 6,
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(255, 206, 32, 0.6)',
            shadowBlur: 20,
            shadowOffsetY: 8,
            borderColor: '#FFCE20',
            borderWidth: 3,
          },
        },
        animationDelay: function (idx: number) {
          return idx * 150 + 75;
        },
      },
      {
        name: 'Temps Maximum',
        type: 'bar',
        data: tempsMax,
        barWidth: '22%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#EE5D50' },
              { offset: 0.3, color: '#dc2626' },
              { offset: 0.7, color: '#b91c1c' },
              { offset: 1, color: '#991b1b' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
          shadowColor: 'rgba(238, 93, 80, 0.4)',
          shadowBlur: 15,
          shadowOffsetY: 6,
        },
        emphasis: {
          itemStyle: {
            shadowColor: 'rgba(238, 93, 80, 0.6)',
            shadowBlur: 20,
            shadowOffsetY: 8,
            borderColor: '#EE5D50',
            borderWidth: 3,
          },
        },
        animationDelay: function (idx: number) {
          return idx * 150 + 150;
        },
      },
    ],
    animationEasing: 'elasticOut',
    animationDuration: 1200,
    animationDurationUpdate: 800,
  };

  return (
    <CardContent sx={{ padding: 0 }}>
      {/* En-tête moderne */}
      <HeaderContainer>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4318FF, #667eea)',
              borderRadius: '16px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(67, 24, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '24px' }}>⏱️</Typography>
          </Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Temps de Traitement
          </Typography>
        </Box>
        <PeriodChip label={getPeriodeLabel(periode)} />
      </HeaderContainer>

      {/* Statistiques globales modernes */}
      <StatsContainer>
        <StatCard sx={{ '--stat-color': '#05CD99' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #05CD99, #10b981)',
                borderRadius: '12px',
                p: 1,
                mr: 1,
                boxShadow: '0 6px 20px rgba(5, 205, 153, 0.3)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>⚡</Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                color: '#05CD99',
                textShadow: '0 2px 4px rgba(5, 205, 153, 0.2)',
                background: 'linear-gradient(135deg, #05CD99, #10b981)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {Math.round(tempsMinGlobal * 10) / 10}h
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Temps Minimum
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #05CD99, #10b981)',
              opacity: 0.6,
            }}
          />
        </StatCard>

        <StatCard sx={{ '--stat-color': '#FFCE20' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #FFCE20, #fbbf24)',
                borderRadius: '12px',
                p: 1,
                mr: 1,
                boxShadow: '0 6px 20px rgba(255, 206, 32, 0.3)',
                animation: 'rotate 3s linear infinite',
                '@keyframes rotate': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>📊</Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                color: '#FFCE20',
                textShadow: '0 2px 4px rgba(255, 206, 32, 0.2)',
                background: 'linear-gradient(135deg, #FFCE20, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {tempsMoyenGlobal}h
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Temps Moyen Global
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #FFCE20, #fbbf24)',
              opacity: 0.6,
            }}
          />
        </StatCard>

        <StatCard sx={{ '--stat-color': '#EE5D50' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #EE5D50, #dc2626)',
                borderRadius: '12px',
                p: 1,
                mr: 1,
                boxShadow: '0 6px 20px rgba(238, 93, 80, 0.3)',
                animation: 'shake 2s infinite',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '25%': { transform: 'translateX(-2px)' },
                  '75%': { transform: 'translateX(2px)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>🔥</Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                color: '#EE5D50',
                textShadow: '0 2px 4px rgba(238, 93, 80, 0.2)',
                background: 'linear-gradient(135deg, #EE5D50, #dc2626)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {Math.round(tempsMaxGlobal * 10) / 10}h
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Temps Maximum
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #EE5D50, #dc2626)',
              opacity: 0.6,
            }}
          />
        </StatCard>

        <StatCard sx={{ '--stat-color': '#4318FF' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #4318FF, #667eea)',
                borderRadius: '12px',
                p: 1,
                mr: 1,
                boxShadow: '0 6px 20px rgba(67, 24, 255, 0.3)',
                animation: 'bounce 1.5s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-4px)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>📦</Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{
                color: '#4318FF',
                textShadow: '0 2px 4px rgba(67, 24, 255, 0.2)',
                background: 'linear-gradient(135deg, #4318FF, #667eea)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {totalCommandesLivrees}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" fontWeight="600">
            Total Livraisons
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #4318FF, #667eea)',
              opacity: 0.6,
            }}
          />
        </StatCard>
      </StatsContainer>

      {/* Graphique moderne avec en-tête */}
      <ChartContainer>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #05CD99, #FFCE20, #EE5D50)',
                borderRadius: '10px',
                p: 1,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                animation: 'colorShift 4s infinite',
                '@keyframes colorShift': {
                  '0%': { background: 'linear-gradient(135deg, #05CD99, #10b981)' },
                  '33%': { background: 'linear-gradient(135deg, #FFCE20, #fbbf24)' },
                  '66%': { background: 'linear-gradient(135deg, #EE5D50, #dc2626)' },
                  '100%': { background: 'linear-gradient(135deg, #05CD99, #10b981)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '18px' }}>📊</Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Comparaison des Performances
            </Typography>
          </Box>

          {/* Indicateur de performance globale */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                background:
                  tempsMoyenGlobal <= 12
                    ? 'linear-gradient(135deg, #05CD99, #10b981)'
                    : tempsMoyenGlobal <= 24
                      ? 'linear-gradient(135deg, #FFCE20, #fbbf24)'
                      : 'linear-gradient(135deg, #EE5D50, #dc2626)',
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {tempsMoyenGlobal <= 12
                ? '🚀 Excellent'
                : tempsMoyenGlobal <= 24
                  ? '⚡ Bon'
                  : '🔥 À améliorer'}
            </Box>
          </Box>
        </Box>

        <Box sx={{ height: 'calc(100% - 60px)' }}>
          <ReactEchart echarts={echarts} option={option} style={{ height: '100%' }} />
        </Box>
      </ChartContainer>

      {/* Analyse des performances moderne */}
      <AnalysisContainer>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4318FF, #667eea)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(67, 24, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '20px' }}>📈</Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#4318FF',
              textShadow: '0 1px 2px rgba(67, 24, 255, 0.1)',
            }}
          >
            Analyse des Performances
          </Typography>
        </Box>

        {/* Livreur le plus rapide */}
        {livreursData.length > 0 && (
          <Box
            mb={2}
            p={2.5}
            sx={{
              background:
                'linear-gradient(135deg, rgba(5, 205, 153, 0.1), rgba(5, 205, 153, 0.05))',
              borderRadius: '12px',
              border: '2px solid rgba(5, 205, 153, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #05CD99, #10b981)',
              },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#1f2937',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>🏃‍♂️</Typography>
              <strong>Livreur le plus rapide :</strong>{' '}
              <Typography
                component="span"
                sx={{
                  color: '#05CD99',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(5, 205, 153, 0.2)',
                }}
              >
                {
                  livreursData.reduce((prev, current) =>
                    prev.tempsMoyenHeures < current.tempsMoyenHeures ? prev : current,
                  ).nomLivreur
                }
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                (
                {Math.round(
                  livreursData.reduce((prev, current) =>
                    prev.tempsMoyenHeures < current.tempsMoyenHeures ? prev : current,
                  ).tempsMoyenHeures * 10,
                ) / 10}
                h en moyenne)
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Recommandations */}
        <Box
          p={2.5}
          sx={{
            background:
              'linear-gradient(135deg, rgba(255, 206, 32, 0.1), rgba(255, 206, 32, 0.05))',
            borderRadius: '12px',
            border: '2px solid rgba(255, 206, 32, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #FFCE20, #fbbf24)',
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#1f2937',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: '20px', mt: 0.2 }}>💡</Typography>
            <Box>
              <Typography component="span" sx={{ fontWeight: 700, color: '#b45309' }}>
                Recommandations :
              </Typography>
              <Typography
                component="span"
                sx={{
                  color: '#6b7280',
                  fontWeight: 500,
                  ml: 1,
                }}
              >
                {tempsMoyenGlobal > 24
                  ? "Les temps de traitement sont élevés. Considérez l'optimisation des routes et la formation des livreurs."
                  : tempsMoyenGlobal > 12
                    ? 'Les temps de traitement sont dans la moyenne. Identifiez les meilleures pratiques des livreurs les plus rapides.'
                    : 'Excellents temps de traitement ! Maintenez ces performances.'}
              </Typography>
            </Box>
          </Typography>
        </Box>
      </AnalysisContainer>
    </CardContent>
  );
};

export default TempsTraitement;
