import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { CommandeDetailsDTO } from './types';

const CommandeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<CommandeDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommandeDetails();
  }, [id]);

  const fetchCommandeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5283/api/commandes/details/${id}`);
      setCommande(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(value);
  };

  // Fonction formatDate modifiée pour gérer les undefined
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'livré':
        return 'success';
      case 'en transit':
        return 'warning';
      case 'en préparation':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Chargement des détails de la commande...</Typography>;
  }

  if (!commande) {
    return <Typography>Commande non trouvée</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="outlined"
        startIcon={<IconifyIcon icon="eva:arrow-back-fill" />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Retour
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">Détails de la Commande #{commande.id}</Typography>
          <Chip label={commande.statut} color={getStatusColor(commande.statut)} variant="filled" />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Date de création: {formatDate(commande.dateCreation)}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Informations Client
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    <strong>Nom:</strong> {commande.nomClient}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Adresse:</strong> {commande.adressClient}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Téléphone:</strong> {commande.telephoneClient}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {commande.emailClient}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Détails Livraison
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    <strong>Livreur:</strong> {commande.utilisateur?.nom} (
                    {commande.utilisateurIdentifiant})
                  </Typography>
                  <Typography variant="body1">
                    <strong>Fournisseur:</strong> {commande.fournisseur?.nom} (
                    {commande.fournisseurIdentifiant})
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Détails Financiers
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        <strong>Description:</strong> {commande.description}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Prix unitaire:</strong> {formatCurrency(commande.prixUnitaire)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Quantité:</strong> {commande.quantite}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        <strong>Montant hors taxe:</strong>{' '}
                        {formatCurrency(commande.montantHorsTax)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>TVA ({commande.tva}%):</strong>{' '}
                        {formatCurrency(commande.montantHorsTax * (commande.tva / 100))}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h6" color="primary">
                        <strong>Montant total:</strong> {formatCurrency(commande.montantTotale)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CommandeDetailsPage;
