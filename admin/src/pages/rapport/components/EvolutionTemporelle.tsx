import { Typography, Box, styled } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Composants stylisés
const EvolutionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: '32px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(40px)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 25px rgba(67, 24, 255, 0.06)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '32px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow: '0 30px 80px rgba(67, 24, 255, 0.12), 0 12px 35px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '24px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(67, 24, 255, 0.06)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
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
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow: '0 25px 60px rgba(67, 24, 255, 0.12), 0 8px 25px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  marginBottom: theme.spacing(5),
  padding: theme.spacing(5),
  borderRadius: '28px',
  background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.06), rgba(4, 190, 254, 0.06))',
  border: '2px solid rgba(67, 24, 255, 0.12)',
  backdropFilter: 'blur(25px)',
  gap: theme.spacing(4),
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
    boxShadow: '0 20px 60px rgba(67, 24, 255, 0.15), 0 8px 25px rgba(4, 190, 254, 0.1)',
    border: '2px solid rgba(67, 24, 255, 0.2)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 colonnes sur grands écrans
  },
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 colonnes sur écrans moyens
  },
  [theme.breakpoints.between('sm', 'md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 colonnes sur écrans moyens-petits (demi-écran)
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr', // 1 colonne sur très petits écrans (mobile)
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(67, 24, 255, 0.04)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '20px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95))',
    boxShadow: '0 20px 60px rgba(67, 24, 255, 0.12), 0 8px 25px rgba(4, 190, 254, 0.08)',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
}));

// Fonction utilitaire pour formater les montants en DT
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

echarts.use([
  BarChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface EvolutionItem {
  periode: string;
  commandesTotales: number;
  commandesLivrees: number;
  revenus: number;
  livreursActifs: number;
}

interface EvolutionTemporelleProps {
  data: {
    evolution: EvolutionItem[];
  } | null;
  periode: string;
}

const EvolutionTemporelle = ({ data, periode }: EvolutionTemporelleProps) => {
  if (!data || !data.evolution) {
    return (
      <EvolutionContainer>
        <Typography variant="h6">Chargement de l'évolution temporelle...</Typography>
      </EvolutionContainer>
    );
  }

  const getPeriodeLabel = (periode: string) => {
    switch (periode) {
      case 'semaine':
        return 'les 7 derniers jours';
      case 'mois':
        return 'les 12 derniers mois';
      case 'annee':
        return 'les 5 dernières années';
      default:
        return 'la période sélectionnée';
    }
  };

  // Préparer les données pour le graphique
  const categories = data.evolution.map((item) => item.periode);
  const commandesTotales = data.evolution.map((item) => item.commandesTotales);
  const commandesLivrees = data.evolution.map((item) => item.commandesLivrees);
  const revenus = data.evolution.map((item) => item.revenus);

  // Configuration pour le graphique des commandes (barres)
  const commandesOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 20,
      textStyle: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: 600,
      },
      padding: [12, 16],
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffsetY: 4,
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.15)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ],
          },
          shadowBlur: 0,
        },
      },
      formatter: function (
        params: Array<{ axisValue: string; seriesName: string; value: number; marker: string }>,
      ) {
        let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #1f2937; font-size: 13px; border-bottom: 1px solid #3b82f6; padding-bottom: 6px; text-align: center;">${params[0].axisValue}</div>`;
        params.forEach((param) => {
          const color = param.seriesName === 'Commandes Totales' ? '#3b82f6' : '#10b981';
          const icon = param.seriesName === 'Commandes Totales' ? '📦' : '✅';
          const percentage =
            params.length > 1 && param.seriesName === 'Commandes Livrées'
              ? ` (${Math.round((param.value / params[0].value) * 100)}%)`
              : '';
          result += `<div style="display: flex; align-items: center; margin: 6px 0; padding: 8px; background: rgba(${color === '#3b82f6' ? '59, 130, 246' : '16, 185, 129'}, 0.06); border-radius: 8px; border-left: 2px solid ${color};">
            <span style="font-size: 14px; margin-right: 8px;">${icon}</span>
            <div style="flex: 1;">
              <div style="color: #374151; font-weight: 500; font-size: 11px; margin-bottom: 2px;">${param.seriesName}</div>
              <div style="color: ${color}; font-weight: 600; font-size: 12px;">${new Intl.NumberFormat('fr-FR').format(param.value)}${percentage}</div>
            </div>
          </div>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Commandes Totales', 'Commandes Livrées'],
      top: 10,
      textStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 500,
      },
      itemGap: 20,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
          width: 1,
        },
      },
      axisTick: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 500,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: '{value}',
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          width: 1,
        },
      },
    },
    series: [
      {
        name: 'Commandes Totales',
        type: 'bar',
        data: commandesTotales,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 0.5, color: '#2563eb' },
              { offset: 1, color: '#1d4ed8' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 12,
          shadowColor: 'rgba(59, 130, 246, 0.4)',
          shadowOffsetY: 6,
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#2563eb' },
                { offset: 0.5, color: '#1d4ed8' },
                { offset: 1, color: '#1e40af' },
              ],
            },
            shadowBlur: 16,
            shadowColor: 'rgba(59, 130, 246, 0.6)',
            shadowOffsetY: 8,
          },
          focus: 'series',
        },
        barWidth: '45%',
        barGap: '15%',
        animationDelay: function (idx: number) {
          return idx * 100;
        },
      },
      {
        name: 'Commandes Livrées',
        type: 'bar',
        data: commandesLivrees,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 0.5, color: '#059669' },
              { offset: 1, color: '#047857' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
          shadowBlur: 12,
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowOffsetY: 6,
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#059669' },
                { offset: 0.5, color: '#047857' },
                { offset: 1, color: '#065f46' },
              ],
            },
            shadowBlur: 16,
            shadowColor: 'rgba(16, 185, 129, 0.6)',
            shadowOffsetY: 8,
          },
          focus: 'series',
        },
        barWidth: '45%',
        animationDelay: function (idx: number) {
          return idx * 100 + 50;
        },
      },
    ],
  };

  // Configuration pour le graphique des revenus (ligne) - Design Ultra-Moderne
  const revenusOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 20,
      textStyle: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: 600,
      },
      padding: [12, 16],
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffsetY: 4,
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.8)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.8)' },
            ],
          },
          width: 3,
          type: 'solid',
        },
        crossStyle: {
          color: 'rgba(245, 158, 11, 0.6)',
          width: 1,
          opacity: 0.8,
        },
      },
      formatter: function (
        params: Array<{ axisValue: string; seriesName: string; value: number; marker: string }>,
      ) {
        const value = formatCurrency(params[0].value);
        return `<div style="font-weight: 600; margin-bottom: 8px; color: #1f2937; font-size: 13px; border-bottom: 1px solid #f59e0b; padding-bottom: 6px; text-align: center;">${params[0].axisValue}</div>
        <div style="display: flex; align-items: center; margin: 6px 0; padding: 8px; background: rgba(245, 158, 11, 0.06); border-radius: 8px; border-left: 2px solid #f59e0b;">
          <span style="font-size: 14px; margin-right: 8px;">💰</span>
          <div style="flex: 1;">
            <div style="color: #374151; font-weight: 500; font-size: 11px; margin-bottom: 2px;">${params[0].seriesName}</div>
            <div style="color: #f59e0b; font-weight: 600; font-size: 12px;">${value}</div>
          </div>
        </div>`;
      },
    },
    legend: {
      data: ['Revenus'],
      top: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
    },
    yAxis: {
      type: 'value',
      name: 'Revenus (DT)',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: 500,
        formatter: function (value: number) {
          return new Intl.NumberFormat('fr-FR').format(value) + ' DT';
        },
      },
      splitLine: {
        lineStyle: {
          color: '#e6e8eb',
          width: 1,
          type: 'solid',
          opacity: 0.3,
        },
      },
    },
    series: [
      {
        name: 'Revenus',
        type: 'line',
        data: revenus,
        itemStyle: {
          color: '#10b981',
          borderWidth: 3,
          borderColor: '#ffffff',
          shadowBlur: 8,
          shadowColor: 'rgba(16, 185, 129, 0.3)',
        },
        lineStyle: {
          width: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#10b981' },
            ],
          },
          shadowBlur: 10,
          shadowColor: 'rgba(16, 185, 129, 0.3)',
        },
        symbol: 'diamond',
        symbolSize: 10,
        smooth: true,
        emphasis: {
          itemStyle: {
            color: '#059669',
            borderWidth: 4,
            shadowBlur: 12,
            shadowColor: 'rgba(16, 185, 129, 0.5)',
          },
          lineStyle: {
            width: 5,
          },
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 0.5, color: 'rgba(16, 185, 129, 0.2)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  // Calculer quelques statistiques rapides
  const totalCommandes = commandesTotales.reduce((a: number, b: number) => a + b, 0);
  const totalLivrees = commandesLivrees.reduce((a: number, b: number) => a + b, 0);
  const totalRevenus = revenus.reduce((a: number, b: number) => a + b, 0);
  const tauxLivraisonMoyen =
    totalCommandes > 0 ? Math.round((totalLivrees / totalCommandes) * 100) : 0;

  return (
    <EvolutionContainer>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(67, 24, 255, 0.3)',
            }}
          >
            <Typography sx={{ fontSize: '28px' }}>📈</Typography>
          </Box>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4318FF, #04BEFE)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Évolution Temporelle
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'rgba(67, 24, 255, 0.1)',
            borderRadius: '25px',
            px: 3,
            py: 1.5,
            border: '2px solid rgba(67, 24, 255, 0.2)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#4318FF',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            📊 Données sur {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      </Box>

      {/* Statistiques rapides */}
      <StatsContainer>
        <StatItem>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#3b82f6',
              mb: 1,
            }}
          >
            {new Intl.NumberFormat('fr-FR').format(totalCommandes)}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            📦 Total Commandes
          </Typography>
        </StatItem>
        <StatItem>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#10b981',
              mb: 1,
            }}
          >
            {new Intl.NumberFormat('fr-FR').format(totalLivrees)}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            ✅ Total Livrées
          </Typography>
        </StatItem>
        <StatItem>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: tauxLivraisonMoyen >= 80 ? '#10b981' : '#ef4444',
              mb: 1,
            }}
          >
            {tauxLivraisonMoyen}%
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            📊 Taux Moyen
          </Typography>
        </StatItem>
        <StatItem>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#f59e0b',
              mb: 1,
            }}
          >
            {formatCurrency(totalRevenus)}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            💰 Total Revenus
          </Typography>
        </StatItem>
      </StatsContainer>

      {/* Graphiques séparés */}
      <Box display="flex" flexDirection="column" gap={4}>
        {/* Graphique des commandes */}
        <ChartContainer>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                borderRadius: '12px',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>📊</Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Évolution des Commandes
            </Typography>
          </Box>
          <Box sx={{ height: 350 }}>
            <ReactEchart echarts={echarts} option={commandesOption} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, fontStyle: 'italic' }}>
            💡 Comparaison entre les commandes totales et les commandes livrées
          </Typography>
        </ChartContainer>

        {/* Graphique des revenus */}
        <ChartContainer>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f59e0b, #10b981)',
                borderRadius: '12px',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Typography sx={{ fontSize: '20px' }}>💰</Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f59e0b, #10b981)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Évolution des Revenus
            </Typography>
          </Box>
          <Box sx={{ height: 350 }}>
            <ReactEchart echarts={echarts} option={revenusOption} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2, fontStyle: 'italic' }}>
            💡 Revenus générés par période avec zone d'ombre pour une meilleure visualisation
          </Typography>
        </ChartContainer>
      </Box>
    </EvolutionContainer>
  );
};

export default EvolutionTemporelle;
