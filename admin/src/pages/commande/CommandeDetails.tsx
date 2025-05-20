import React from 'react';
import {
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { CommandeDetailsDTO } from './types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'react-qr-code';

interface CommandeDetailsProps {
  commande: CommandeDetailsDTO;
  onBack: () => void;
  onPrint: () => void;
}

const CommandeDetails: React.FC<CommandeDetailsProps> = ({ commande, onBack, onPrint }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(value);
  };

  // Données pour le QR code
  const qrCodeData = JSON.stringify({
    id: commande.id,
  });

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="contained"
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            backgroundColor: '#7e57c2',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#5e35b1',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Retour
        </Button>
      </Box>

      {/* Main Content - This is the part that will be printed */}
      <div id="commande-details-content">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
          }}
        >
          <Grid container spacing={4}>
            {/* Commande Information */}
            <Grid item xs={12} md={6} id="info-commande">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '600',
                  color: '#303f9f',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #303f9f',
                  display: 'inline-block',
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  📋
                </Box>
                Informations Commande
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ border: 'none' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: '600',
                          width: '40%',
                          color: '#000000',
                          borderBottom: '1px solid #e0e0e0',
                          py: 1.5,
                        }}
                      >
                        Statut
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1.5 }}>
                        <Box
                          component="span"
                          sx={{
                            p: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor:
                              commande.statut === 'Terminée'
                                ? '#66bb6a'
                                : commande.statut === 'En cours'
                                  ? '#ffa726'
                                  : '#ef5350',
                            color: 'white',
                            fontWeight: '500',
                            display: 'inline-block',
                            fontSize: '0.8rem',
                          }}
                        >
                          {commande.statut}
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Date de Création
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.dateCreation
                          ? new Date(commande.dateCreation).toLocaleString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.description || 'Non spécifiée'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Financial Details */}
            <Grid item xs={12} md={6} id="details-financiers">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '600',
                  color: '#303f9f',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #303f9f',
                  display: 'inline-block',
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  💰
                </Box>
                Détails Financiers
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ border: 'none' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Quantité
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>{commande.quantite}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Prix Unitaire
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {formatCurrency(commande.prixUnitaire)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Montant HT
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {formatCurrency(commande.montantHorsTax)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        TVA
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {formatCurrency(commande.tva)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Montant Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: '600', color: '#2e7d32', py: 1.5 }}>
                        {formatCurrency(commande.montantTotale)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Client Information */}
            <Grid item xs={12} md={6} id="info-client">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '600',
                  color: '#303f9f',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #303f9f',
                  display: 'inline-block',
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  👤
                </Box>
                Client
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ border: 'none' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Nom
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>{commande.nomClient}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Adresse
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>{commande.adressClient}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Téléphone
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.telephoneClient}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>{commande.emailClient}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Supplier Information */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: '600',
                  color: '#303f9f',
                  mb: 2,
                  pb: 1,
                  borderBottom: '2px solid #303f9f',
                  display: 'inline-block',
                }}
              >
                <Box component="span" sx={{ mr: 1 }}>
                  🏭
                </Box>
                Fournisseur
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ border: 'none' }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Nom
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.fournisseur?.nom || '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Adresse
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.fournisseur?.adresse || '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                        Téléphone
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#888' }}>
                        {commande.fournisseur?.telephone || '-'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Delivery Person Information */}
            {commande.utilisateur && (
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '600',
                    color: '#303f9f',
                    mb: 2,
                    pb: 1,
                    borderBottom: '2px solid #303f9f',
                    display: 'inline-block',
                  }}
                >
                  <Box component="span" sx={{ mr: 1 }}>
                    🚚
                  </Box>
                  Livreur
                </Typography>
                <TableContainer>
                  <Table size="small" sx={{ border: 'none' }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                          Nom
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#888' }}>
                          {commande.utilisateur.nom}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#888' }}>
                          {commande.utilisateur.email}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: '600', color: '#000000', py: 1.5 }}>
                          Téléphone
                        </TableCell>
                        <TableCell sx={{ py: 1.5, color: '#888' }}>
                          {commande.utilisateur.telephone}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </Paper>
        {/* QR Code Section */}
        <Box sx={{ mt: 4, textAlign: 'center' }} id="qr-code-section">
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '500' }}>
            QR Code de la commande
          </Typography>
          <Box
            sx={{
              p: 2,
              display: 'inline-block',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
            }}
          >
            <QRCode value={qrCodeData} size={128} level="H" />
          </Box>
          <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
            Scanner ce code pour accéder aux détails de la commande
          </Typography>
        </Box>
      </div>

      {/* Print Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={onPrint}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            padding: '8px 24px',
            backgroundColor: '#26a69a',
            color: 'white',
            fontWeight: '500',
            fontSize: '0.875rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#00897b',
              boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Imprimer
        </Button>
      </Box>
    </Container>
  );
};

export default CommandeDetails;
