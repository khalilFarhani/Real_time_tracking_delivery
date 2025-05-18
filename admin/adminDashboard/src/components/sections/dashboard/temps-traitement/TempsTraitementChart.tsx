import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import * as echarts from 'echarts/core';
import { PictorialBarChart } from 'echarts/charts';
import ReactEchart from 'components/base/ReactEchart';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  PictorialBarChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

interface TempsTraitementChartProps {
  data: {
    ids: string[];
    temps: number[];
    livreurs: string[];
  };
}

// Types pour les paramètres ECharts
interface EChartsTooltipParam {
  componentType: string;
  seriesType: string;
  seriesIndex: number;
  seriesName: string;
  name: string;
  dataIndex: number;
  data: unknown;
  value: number | number[];
  color: string;
  percent: number;
  dataType?: string;
  axisValue?: string | number;
  axisValueLabel?: string;
}

interface EChartsItemStyleParam {
  dataIndex: number;
  seriesIndex: number;
  data: unknown;
  name: string;
  value: number | number[];
  color: string;
  borderColor: string;
  borderWidth: number;
  borderType: string;
  borderDashOffset: number;
  borderCap: string;
  borderJoin: string;
  borderMiterLimit: number;
}

const TempsTraitementChart = ({ data, ...rest }: TempsTraitementChartProps) => {
  const theme = useTheme();

  // Fonction pour formater le temps en heures et minutes
  const formatTemps = (heures: number) => {
    const h = Math.floor(heures);
    const m = Math.round((heures - h) * 60);

    if (h === 0) {
      return `${m} min`;
    } else if (m === 0) {
      return `${h} h`;
    } else {
      return `${h} h ${m} min`;
    }
  };

  // Trier les données par ID croissant
  const sortedData = useMemo(() => {
    const combined = data.ids.map((id, index) => ({
      id: id.replace('#', ''), // Enlever le préfixe "#" si présent
      temps: data.temps[index],
      livreur: data.livreurs[index],
    }));

    // Trier par ID (en convertissant en nombre si possible)
    combined.sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      return idA - idB;
    });

    return {
      ids: combined.map((item) => item.id),
      temps: combined.map((item) => item.temps),
      livreurs: combined.map((item) => item.livreur),
    };
  }, [data]);

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: EChartsTooltipParam[]) => {
          const index = params[0].dataIndex;
          return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 5px;">ID: ${sortedData.ids[index]}</div>
            <div>Temps: ${formatTemps(sortedData.temps[index])}</div>
            <div>Livreur: ${sortedData.livreurs[index]}</div>
          </div>
        `;
        },
        backgroundColor: '#fff',
        borderRadius: 8,
        textStyle: {
          color: 'ccc',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.ids,
        axisLabel: {
          color: theme.palette.text.secondary,
          fontSize: 10,
          interval: 0,
          rotate: 0,
          formatter: (value: string) => value,
        },
        axisLine: {
          lineStyle: {
            color: theme.palette.divider,
          },
        },
      },
      yAxis: {
        type: 'value',
        name: '',
        nameTextStyle: {
          color: theme.palette.text.secondary,
        },
        axisLabel: {
          color: theme.palette.text.secondary,
          formatter: (value: number) => formatTemps(value),
        },
        splitLine: {
          lineStyle: {
            color: theme.palette.divider,
            type: 'dashed',
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          show: sortedData.ids.length > 8,
          start: 0,
          end: 100,
          height: 20,
          bottom: 0,
          borderColor: 'transparent',
          backgroundColor: theme.palette.background.paper,
          fillerColor: theme.palette.primary.main + '30',
          handleStyle: {
            color: theme.palette.primary.main,
          },
          textStyle: {
            color: theme.palette.text.secondary,
          },
        },
      ],
      series: [
        {
          name: 'Temps de traitement',
          type: 'pictorialBar',
          symbol:
            'path://M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z',
          symbolSize: [25, 25],
          symbolOffset: [0, 0],
          symbolPosition: 'end',
          z: 12,
          itemStyle: {
            color: (params: EChartsItemStyleParam) => {
              // Dégradé de couleurs basé sur le temps de traitement
              const value = sortedData.temps[params.dataIndex];
              const maxValue = Math.max(...sortedData.temps);
              const ratio = value / maxValue;

              if (ratio < 0.33) {
                return theme.palette.success.main; // Vert (#05CD99)
              } else if (ratio < 0.66) {
                return theme.palette.warning.main; // Jaune (#FFCE20)
              } else {
                return theme.palette.error.main; // Rouge (#EE5D50)
              }
            },
          },
          data: sortedData.temps,
          barWidth: '60%',
        },
      ],
    }),
    [theme, sortedData],
  );

  return <ReactEchart echarts={echarts} option={option} style={{ height: '100%' }} {...rest} />;
};

export default TempsTraitementChart;
