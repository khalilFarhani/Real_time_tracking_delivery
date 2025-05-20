import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { TooltipComponentOption } from 'echarts';
import { CSSProperties } from 'react';

// Register the required components
echarts.use([LineChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

// Type pour les paramètres du tooltip
interface TooltipParam {
  componentType: string;
  componentSubType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: number;
  value: number;
  color: string;
  marker: string;
}

interface CommandesFournisseursChartProps {
  data: {
    labels: string[];
    commandes: number[];
    fournisseurs: number[];
  };
  sx?: SxProps<Theme>;
}

const CommandesFournisseursChart = ({ data, sx }: CommandesFournisseursChartProps) => {
  const theme = useTheme();

  // Convertir SxProps en CSSProperties de manière sécurisée
  const styleProps: CSSProperties | undefined = sx
    ? (Object.fromEntries(
        Object.entries(sx as Record<string, unknown>).filter(([, v]) => v !== undefined),
      ) as CSSProperties)
    : undefined;

  const option = useMemo(
    () => ({
      grid: {
        top: 5,
        bottom: 5, // Augmenté pour donner plus d'espace aux labels des mois
        left: 10,
        right: 12,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
        },
        backgroundColor: theme.palette.primary.dark,
        padding: [10, 18, 10, 18],
        borderRadius: 10,
        borderWidth: 0,
        textStyle: {
          color: theme.palette.info.light,
          fontFamily: theme.typography.fontFamily,
        },
        extraCssText: 'border: none; box-shadow: none',
        confine: true,
        formatter: function (params: TooltipParam[]) {
          // Récupérer le mois (label de l'axe X)
          const mois = params[0].name;

          // Créer le contenu du tooltip
          let tooltipContent = `<div style="font-weight: bold; margin-bottom: 5px;">${mois}</div>`;

          // Parcourir chaque série (commandes et fournisseurs)
          params.forEach((param) => {
            const seriesName = param.seriesName;
            const value = param.value;
            const color = param.color;

            tooltipContent += `<div style="display: flex; align-items: center; margin-top: 3px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; margin-right: 8px;"></span>
              <span>${seriesName} ${value}</span>
            </div>`;
          });

          return tooltipContent;
        },
        position: (
          point: [number, number],
          _params: TooltipComponentOption[],
          _dom: HTMLElement,
          _rect: unknown,
          size: { contentSize: [number, number]; viewSize: [number, number] },
        ) => {
          const [x, y] = point;
          const tooltipHeight = size.contentSize[1];
          const topOffset = y - tooltipHeight - 20;
          const bottomOffset = y + 20;

          if (topOffset > 0) {
            return [x - size.contentSize[0] / 2, topOffset];
          } else {
            return [x - size.contentSize[0] / 2, bottomOffset];
          }
        },
      },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          margin: 15, // Augmenté pour plus d'espace
          color: theme.palette.text.disabled,
          fontSize: 12, // Augmenté pour une meilleure lisibilité
          fontFamily: theme.typography.fontFamily,
          fontWeight: 500,
        },
        splitLine: {
          show: false,
        },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          name: 'Commandes',
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: theme.palette.primary.main,
          },
          lineStyle: {
            width: 4,
            type: 'solid',
            cap: 'round',
            color: theme.palette.primary.main,
          },
          emphasis: {
            scale: true,
            focus: 'series',
            itemStyle: {
              symbolSize: 16, // Augmenté de 12 à 16 pour un cercle encore plus grand
              color: '#FFFFFF', // Cercle blanc
              borderWidth: 3, // Bordure épaisse
              borderColor: theme.palette.primary.main, // Couleur de la bordure identique à la courbe
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
                {
                  offset: 0,
                  color: theme.palette.primary.main + '20', // 20% opacity
                },
                {
                  offset: 1,
                  color: theme.palette.primary.main + '00', // 0% opacity
                },
              ],
            },
          },
          data: data.commandes,
        },
        {
          name: 'Fournisseurs',
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: theme.palette.secondary.main,
          },
          lineStyle: {
            width: 4,
            type: 'solid',
            cap: 'round',
            color: theme.palette.secondary.main,
          },
          emphasis: {
            scale: true,
            focus: 'series',
            itemStyle: {
              symbolSize: 16, // Augmenté de 12 à 16 pour un cercle encore plus grand
              color: '#FFFFFF', // Cercle blanc
              borderWidth: 3, // Bordure épaisse
              borderColor: theme.palette.secondary.main, // Couleur de la bordure identique à la courbe
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
                {
                  offset: 0,
                  color: theme.palette.secondary.main + '20', // 20% opacity
                },
                {
                  offset: 1,
                  color: theme.palette.secondary.main + '00', // 0% opacity
                },
              ],
            },
          },
          data: data.fournisseurs,
        },
      ],
    }),
    [theme, data],
  );

  return (
    <ReactEchartsCore
      echarts={echarts}
      option={option}
      style={styleProps}
      opts={{ renderer: 'canvas' }}
    />
  );
};

export default CommandesFournisseursChart;
