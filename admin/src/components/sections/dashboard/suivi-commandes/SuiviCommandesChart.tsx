import { useMemo } from 'react';
import { SxProps, useTheme } from '@mui/material';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import ReactEchart from 'components/base/ReactEchart';
import {
  TooltipComponent,
  GridComponent,
  AxisPointerComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TooltipComponent,
  GridComponent,
  AxisPointerComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface SuiviCommandesChartProps {
  data: number[];
  labels: string[];
  sx?: SxProps;
}

const SuiviCommandesChart = ({ data, labels, ...rest }: SuiviCommandesChartProps) => {
  const theme = useTheme();

  // Couleurs pour différents statuts
  const getColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'en attente':
        return '#FFA500'; // Orange
      case 'en cours':
        return '#4318FF'; // Bleu (primary)
      case 'livrée':
        return '#05CD99'; // Vert (success)
      case 'annulée':
        return '#FF5252'; // Rouge (error)
      default:
        return theme.palette.primary.main;
    }
  };

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} commandes',
      },
      grid: {
        top: '22%',
        left: '5%',
        right: '5%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: labels,
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: 20,
            fontWeight: 500,
            color: theme.palette.text.disabled,
            fontSize: theme.typography.caption.fontSize,
            fontFamily: theme.typography.fontFamily,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            formatter: '{value}',
            color: theme.palette.text.disabled,
          },
          splitLine: {
            lineStyle: {
              color: theme.palette.divider,
            },
          },
        },
      ],
      series: [
        {
          name: 'Commandes',
          type: 'bar',
          barWidth: '40%',
          showBackground: false,
          data: data.map((value, index) => ({
            value,
            itemStyle: {
              color: getColor(labels[index]),
              borderRadius: [10, 10, 0, 0],
            },
          })),
        },
      ],
    }),
    [theme, data, labels],
  );

  return <ReactEchart echarts={echarts} option={option} {...rest} />;
};

export default SuiviCommandesChart;
