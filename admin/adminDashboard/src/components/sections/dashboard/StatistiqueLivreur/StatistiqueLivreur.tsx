import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import ReactEchart from 'components/base/ReactEchart';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ButtonBase from '@mui/material/ButtonBase';
import IconifyIcon from 'components/base/IconifyIcon';

echarts.use([BarChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

interface LivreurStat {
  livreurId: number;
  nomLivreur: string;
  nombreCommandesTotal: number;
  nombreCommandesEnTransit: number;
  nombreCommandesLivrees: number;
}

// Interface pour les paramètres du tooltip ECharts
interface EChartsTooltipParam {
  seriesName: string;
  name: string;
  value: number;
  axisValue: string;
  color: string;
  dataIndex: number;
}

const StatistiqueLivreur = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livreursStats, setLivreursStats] = useState<LivreurStat[]>([]);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<LivreurStat[]>(
          `${API_URL}/api/statistiques/livreurs-commandes-mois`,
        );

        // Utiliser directement les données du backend
        setLivreursStats(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques des livreurs:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Préparer les données pour le graphique
  const chartOption = useMemo(() => {
    const livreurIds = livreursStats.map((item) => `ID ${item.livreurId}`);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params: EChartsTooltipParam[]) {
          const livreurId = params[0].axisValue;
          const livreur = livreursStats.find((l) => `ID ${l.livreurId}` === livreurId);

          if (!livreur) return '';

          return `
            <div style="padding: 10px;">
              <div style="margin-bottom: 5px; font-weight: bold;">${livreurId} - ${livreur.nomLivreur}</div>
              <div>Total: ${livreur.nombreCommandesTotal}</div>
              <div>Livrées: ${livreur.nombreCommandesLivrees} </div>
              <div>En transit: ${livreur.nombreCommandesEnTransit}</div>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: livreurIds,
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: theme.palette.divider,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: false, // Supprime les lignes horizontales
        },
        axisLabel: {
          show: false, // Supprime les nombres sur l'axe Y
        },
      },
      series: [
        {
          name: 'Total',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          itemStyle: {
            color: theme.palette.primary.main, // Bleu foncé (#4318FF)
            borderRadius: [0, 0, 0, 0],
          },
          emphasis: {
            focus: 'series',
          },
          data: livreursStats.map((item) => {
            // Appliquer les coins arrondis si c'est la seule série visible
            const hasRoundedTop =
              item.nombreCommandesEnTransit === 0 && item.nombreCommandesLivrees === 0;
            return {
              value: item.nombreCommandesTotal,
              itemStyle: hasRoundedTop ? { borderRadius: [10, 10, 0, 0] } : {},
            };
          }),
          z: 1,
        },
        {
          name: 'Commandes livrées',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          itemStyle: {
            color: theme.palette.secondary.light, // Bleu ciel (#6AD2FF)
            borderRadius: [0, 0, 0, 0],
          },
          emphasis: {
            focus: 'series',
          },
          data: livreursStats.map((item) => {
            // Appliquer les coins arrondis si c'est la série du haut (pas de transit)
            const hasRoundedTop =
              item.nombreCommandesEnTransit === 0 && item.nombreCommandesLivrees > 0;
            return {
              value: item.nombreCommandesLivrees,
              itemStyle: hasRoundedTop ? { borderRadius: [10, 10, 0, 0] } : {},
            };
          }),
          z: 2,
        },
        {
          name: 'Commandes en transit',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          itemStyle: {
            color: theme.palette.grey[300], // Gris
            borderRadius: [0, 0, 0, 0], // Par défaut pas de coins arrondis
          },
          emphasis: {
            focus: 'series',
          },
          data: livreursStats.map((item) => {
            // Toujours appliquer les coins arrondis si cette série est présente
            return {
              value: item.nombreCommandesEnTransit,
              itemStyle: item.nombreCommandesEnTransit > 0 ? { borderRadius: [10, 10, 0, 0] } : {},
            };
          }),
          z: 3,
        },
      ],
    };
  }, [livreursStats, theme]);

  return (
    <Box component={Card} height={350}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={2.5} pb={0}>
        <Typography variant="h4">Statistiques Livreurs - Mois en cours</Typography>
        <Stack
          component={ButtonBase}
          alignItems="center"
          justifyContent="center"
          height={36}
          width={36}
          bgcolor="info.main"
          borderRadius={2.5}
        >
          <IconifyIcon icon="ic:round-bar-chart" color="primary.main" fontSize="h4.fontSize" />
        </Stack>
      </Stack>

      {loading ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}
        >
          <Typography>Chargement des données...</Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : livreursStats.length === 0 ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}
        >
          <Typography>Aucune donnée disponible</Typography>
        </Box>
      ) : (
        <ReactEchart
          echarts={echarts}
          option={chartOption}
          sx={{ height: '265px !important', pt: 1 }}
        />
      )}
    </Box>
  );
};

export default StatistiqueLivreur;
