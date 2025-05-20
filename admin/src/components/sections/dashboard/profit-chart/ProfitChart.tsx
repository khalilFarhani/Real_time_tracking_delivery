import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ProfitChartProps {
  data: {
    labels: string[];
    profits: number[];
  };
  periode: 'semaine' | 'mois' | 'annee';
}

const ProfitChart = ({ data, periode }: ProfitChartProps) => {
  const theme = useTheme();

  // Formater les étiquettes des jours en français
  const formatDayLabel = (dayLabel: string) => {
    const dayMap: { [key: string]: string } = {
      Mon: 'Lun',
      Tue: 'Mar',
      Wed: 'Mer',
      Thu: 'Jeu',
      Fri: 'Ven',
      Sat: 'Sam',
      Sun: 'Dim',
    };

    return dayMap[dayLabel] || dayLabel;
  };

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      grid: {
        show: true,
        borderColor: theme.palette.divider,
        strokeDashArray: 4,
        padding: {
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
      xaxis: {
        categories: data.labels,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary,
          },
          formatter: (value) => {
            // Si c'est la période semaine, formater les jours en français
            if (periode === 'semaine') {
              return formatDayLabel(value);
            }
            return value;
          },
          // Rotation des étiquettes pour les mois et les années pour une meilleure lisibilité
          rotate: periode === 'mois' ? -45 : 0,
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return value.toFixed(0) + ' DT';
          },
          style: {
            colors: theme.palette.text.secondary,
          },
        },
      },
      tooltip: {
        theme: theme.palette.mode,
        y: {
          formatter: (value) => {
            return new Intl.NumberFormat('fr-TN', {
              style: 'currency',
              currency: 'TND',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
        x: {
          formatter: (value) => {
            if (periode === 'semaine') {
              // Convertir la valeur en chaîne avant de la passer à formatDayLabel
              return `Jour: ${formatDayLabel(String(value))}`;
            } else if (periode === 'mois') {
              return `Mois: ${value}`;
            } else {
              return `Année: ${value}`;
            }
          },
        },
      },
      colors: [theme.palette.primary.main],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: [theme.palette.primary.light],
          inverseColors: false,
          opacityFrom: 0.8,
          opacityTo: 0.2,
          stops: [0, 100],
        },
      },
      legend: {
        show: false,
      },
      // Ajuster les marges pour s'assurer que toutes les étiquettes sont visibles
      margin: {
        bottom: periode === 'mois' ? 20 : 10,
      },
    }),
    [theme, data.labels, periode],
  );

  const chartSeries = [
    {
      name: 'Profit',
      data: data.profits,
    },
  ];

  return <ReactApexChart options={chartOptions} series={chartSeries} type="area" height="100%" />;
};

export default ProfitChart;
