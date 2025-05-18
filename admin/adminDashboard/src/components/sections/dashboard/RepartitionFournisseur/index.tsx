import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';
import {
  Stack,
  Paper,
  MenuItem,
  Typography,
  FormControl,
  Select,
  SelectChangeEvent,
  SxProps,
} from '@mui/material';
import EChartsReactCore from 'echarts-for-react/lib/core';
import DistributionChart from './RepartitionFournisseur';
import axios from 'axios';

const API_URL = 'http://localhost:5283';

interface SupplierApiData {
  fournisseurId: number; // minuscule maintenant
  nomFournisseur: string; // minuscule
  nombreTotalCommandes: number; // minuscule
  montantTotal: number; // minuscule
}

interface SupplierData {
  id: number;
  value: number;
  name: string;
  visible: boolean;
  amount: number;
}

interface SupplierDistributionChartProps {
  sx?: SxProps;
}

const RepartitionFournisseur = ({ sx }: SupplierDistributionChartProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [chartData, setChartData] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<EChartsReactCore>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchSupplierData();
  }, [timeRange]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Déterminer l'endpoint en fonction de la période sélectionnée
      let endpoint = `${API_URL}/api/statistiques/commandes-par-fournisseur`;

      // Ajouter le paramètre de période si nécessaire
      if (timeRange !== 'all') {
        endpoint += `?periode=${timeRange}`;
      }

      const response = await axios.get<SupplierApiData[]>(endpoint);

      const processedData = (response.data || [])
        .map((item, index) => ({
          id: item?.fournisseurId || index + 1,
          value: item?.nombreTotalCommandes || 0,
          name: item?.nomFournisseur || `Fournisseur ${index + 1}`,
          visible: true,
          amount: item?.montantTotal || 0,
        }))
        .filter((item) => item.value > 0);

      setChartData(processedData);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement des données');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSelectChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value as 'week' | 'month' | 'all');
  };

  // Removed the unused toggleVisibility function

  const getColorForId = (id: number) => {
    // Palette de couleurs étendue et harmonieuse avec le design
    const colors = [
      theme.palette.primary.main, // Violet principal (#4318FF)
      theme.palette.secondary.main, // Bleu ciel (#04BEFE)
      theme.palette.success.main, // Vert (#05CD99)
      theme.palette.warning.main, // Jaune (#FFCE20)
      theme.palette.error.main, // Rouge (#EE5D50)
      theme.palette.primary.light, // Violet clair (#6946ff)
      theme.palette.secondary.light, // Bleu ciel clair (#6AD2FF)
      theme.palette.info.dark, // Bleu foncé
      '#FFA500', // Orange
      '#800080', // Violet foncé
      '#008080', // Turquoise
      '#FF6347', // Tomate
      '#4B0082', // Indigo
      '#2E8B57', // Vert mer
      '#9932CC', // Orchidée foncée
      '#1E90FF', // Bleu dodger
      '#FF1493', // Rose profond
      '#32CD32', // Vert lime
      '#FF8C00', // Orange foncé
      '#8A2BE2', // Bleu violet
    ];

    // Assurer que chaque fournisseur a une couleur unique
    return colors[(id - 1) % colors.length];
  };

  if (loading) {
    return (
      <Paper
        sx={{
          py: 2.5,
          height: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Chargement...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          py: 2.5,
          height: 350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ py: 2.5, height: 350, ...sx }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2}>
        <Typography variant="body1" fontWeight={700}>
          Répartition par Fournisseur
        </Typography>

        <FormControl variant="filled" size="small" sx={{ minWidth: 120 }}>
          <Select value={timeRange} onChange={handleSelectChange}>
            <MenuItem value="week">Semaine</MenuItem>
            <MenuItem value="month">Mois</MenuItem>
            <MenuItem value="all">Tout</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <DistributionChart
        chartRef={chartRef}
        data={chartData}
        getColorForId={getColorForId}
        sx={{ height: '200px !important', mt: '40px' }}
      />
    </Paper>
  );
};

export default RepartitionFournisseur;
