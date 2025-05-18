import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import * as echarts from 'echarts/core';
import { FunnelChart } from 'echarts/charts';
import ReactEchart from 'components/base/ReactEchart';
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([FunnelChart, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

interface TempsTraitementGaugeChartProps {
  data: {
    ids: string[];
    temps: number[];
    livreurs: string[];
  };
}

// Type pour les paramètres du tooltip et du formateur
interface TooltipParamItem {
  name: string;
  value: number;
  percent: number;
}

const TempsTraitementGaugeChart = ({ data, ...rest }: TempsTraitementGaugeChartProps) => {
  const theme = useTheme();

  // Regrouper les données par plage de temps
  const categorizedData = useMemo(() => {
    // Définir les plages de temps (en heures) avec les couleurs demandées
    const ranges = [
      { max: 12, label: 'Très rapide (< 12h)', color: theme.palette.grey[400] }, // Gris
      { max: 24, label: 'Rapide (12-24h)', color: theme.palette.grey[400] }, // Gris
      { max: 48, label: 'Moyenne (24-48h)', color: theme.palette.secondary.main }, // Bleu ciel (#04BEFE)
      { max: Infinity, label: 'Lent (> 48h)', color: theme.palette.primary.main }, // Bleu/Violet principal (#4318FF)
    ];

    // Initialiser les compteurs
    const counts = ranges.map((range) => ({
      value: 0,
      name: range.label,
      itemStyle: { color: range.color },
    }));

    // Compter les commandes dans chaque plage
    data.temps.forEach((temps) => {
      for (let i = 0; i < ranges.length; i++) {
        if (temps <= ranges[i].max) {
          counts[i].value++;
          break;
        }
      }
    });

    // Filtrer les plages sans commandes
    return counts.filter((item) => item.value > 0);
  }, [data.temps, theme]);

  const option = useMemo(
    () => ({
      title: {
        text: 'Distribution des temps de livraison',
        left: 'center',
        top: 20,
        textStyle: {
          color: theme.palette.text.primary,
          fontWeight: 700,
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: TooltipParamItem) => {
          const percent = params.percent.toFixed(1);
          return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${params.name}</div>
            <div>Nombre: ${params.value} commande(s)</div>
            <div>Pourcentage: ${percent}%</div>
          </div>
        `;
        },

        borderColor: 'fff',
        backgroundColor: '#fff',
        borderRadius: 8,
        textStyle: {
          color: 'ccc',
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        data: categorizedData.map((item) => item.name),
        textStyle: {
          color: theme.palette.text.secondary,
          fontSize: 10, // Taille réduite pour la légende
        },
        itemWidth: 10, // Taille réduite des icônes de légende
        itemHeight: 10, // Taille réduite des icônes de légende
        itemGap: 6, // Espacement réduit
      },
      series: [
        {
          name: 'Temps de livraison',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: data.temps.length,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: { value: number; percent: number }) => {
              return `${params.value} (${params.percent.toFixed(0)}%)`;
            },
            fontSize: 10, // Taille réduite pour les étiquettes
            color: theme.palette.info.lighter,
            fontWeight: 'bold',
          },
          emphasis: {
            label: {
              fontSize: 12, // Taille réduite pour les étiquettes en survol
              fontWeight: 'bold',
            },
          },
          data: categorizedData,
        },
      ],
    }),
    [theme, categorizedData, data.temps.length],
  );

  return <ReactEchart echarts={echarts} option={option} style={{ height: '100%' }} {...rest} />;
};

export default TempsTraitementGaugeChart;
