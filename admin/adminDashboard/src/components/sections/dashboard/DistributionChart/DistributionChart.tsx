import { SxProps } from '@mui/material';
import ReactEchart from 'components/base/ReactEchart';
import EChartsReactCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useMemo } from 'react';

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface DistributionChartProps {
  sx?: SxProps;
  chartRef: React.RefObject<EChartsReactCore>;
  data: {
    id: number;
    value: number;
    name: string;
    visible: boolean;
    amount: number;
  }[];
  getColorForId: (id: number) => string;
}

const DistributionChart = ({ chartRef, data, getColorForId, ...rest }: DistributionChartProps) => {
  const option = useMemo(() => {
    const visibleData = data.filter((item) => item.visible);

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: {
          name: string;
          value: number;
          percent: number;
          data?: {
            amount?: number;
            [key: string]: unknown;
          };
        }) => {
          const amount = params.data?.amount || 0;
          return `
            <strong>${params.name}</strong><br/>
            Commandes: ${params.value}<br/>
            Montant: ${amount.toLocaleString('fr-FR', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 })}<br/>
            ${params.percent.toFixed(2)}%
          `;
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: visibleData.map((item) => ({
            value: item.value,
            name: item.name,
            amount: item.amount,
            itemStyle: { color: getColorForId(item.id) },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }, [data, getColorForId]);

  return <ReactEchart ref={chartRef} echarts={echarts} option={option} {...rest} />;
};

export default DistributionChart;
