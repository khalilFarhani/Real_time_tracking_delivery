import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommandeList from './CommandeList';
import CommandeForm from './CommandeForm';
import CommandeDetails from './CommandeDetails';
import {
  CommandeDTO,
  CommandeDetailsDTO,
  UtilisateurIdentifiant,
  FournisseurIdentifiant,
} from './types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const GestionCommande: React.FC = () => {
  const [commandes, setCommandes] = useState<CommandeDTO[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurIdentifiant[]>([]);
  const [fournisseurs, setFournisseurs] = useState<FournisseurIdentifiant[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentCommande, setCurrentCommande] = useState<CommandeDTO | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<CommandeDetailsDTO | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const [deleteErrorOpen, setDeleteErrorOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [commandeToDelete, setCommandeToDelete] = useState<number | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchCommandes();
    fetchUtilisateurs();
    fetchFournisseurs();
  }, []);

  const fetchCommandes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commandes/liste`);
      setCommandes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/utilisateurs/identifiants`);
      setUtilisateurs(
        response.data.map((identifiant: string, index: number) => ({
          id: index + 1,
          identifiant,
        })),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs/identifiants`);
      setFournisseurs(
        response.data.map((identifiant: string, index: number) => ({
          id: index + 1,
          identifiant,
        })),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs :', error);
    }
  };

  const handleSave = async (commandeData: {
    statut?: string;
    utilisateurIdentifiant: string;
    fournisseurIdentifiant: string;
    description: string;
    prixUnitaire: number;
    quantite: number;
    tva: number;
    montantTotale: number;
    adressClient: string;
    nomClient: string;
    telephoneClient: string;
    emailClient: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const dataToSend = {
        ...commandeData,
        statut: currentCommande ? commandeData.statut : 'en préparation',
        prixUnitaire: Number(commandeData.prixUnitaire),
        quantite: Number(commandeData.quantite),
        tva: Number(commandeData.tva),
        latitude: Number(commandeData.latitude),
        longitude: Number(commandeData.longitude),
      };

      if (currentCommande) {
        await axios.put(`${API_URL}/api/commandes/modifier/${currentCommande.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/api/commandes/ajouter`, dataToSend);
      }
      fetchCommandes();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande :', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/commandes/supprimer/${id}`);
      fetchCommandes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande :', error);

      // Show error dialog with details
      if (axios.isAxiosError(error) && error.response) {
        let errorMsg = 'Une erreur est survenue lors de la suppression de la commande.';

        // If there's a specific error message from the server
        if (error.response.data && typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }

        setDeleteError(errorMsg);
        setDeleteErrorOpen(true);
      }
    }
  };

  const confirmDelete = (id: number) => {
    setCommandeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (commandeToDelete) {
      await handleDelete(commandeToDelete);
      setCommandeToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/commandes/details/${id}`);
      setSelectedCommande(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande :', error);
    }
  };

  const handlePrint = () => {
    if (!selectedCommande) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Format currency for display
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'TND',
        minimumFractionDigits: 3,
      }).format(value);
    };

    // Get the content from the specific sections
    const infoCommande = document.getElementById('info-commande');
    const detailsFinanciers = document.getElementById('details-financiers');
    const infoClient = document.getElementById('info-client');
    const qrCodeSection = document.getElementById('qr-code-section');

    // Write the HTML content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Bon Commande ${selectedCommande.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #333; 
              margin: 0;
            }
            .print-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            h1 {
              text-align: center;
              color: #303f9f;
              margin-bottom: 20px;
              font-size: 1.8rem;
            }
            .section-title {
              font-weight: 600;
              color: #303f9f;
              margin: 20px 0 10px 0;
              font-size: 1.3rem;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            td {
              padding: 8px;
              vertical-align: top;
              border-bottom: 1px solid #e0e0e0;
            }
            .label {
              font-weight: 600;
              width: 40%;
              color: #000;
            }
            .value { color: #666; }
            .status {
              padding: 4px 12px;
              border-radius: 12px;
              color: white;
              font-weight: 500;
              display: inline-block;
              font-size: 0.8rem;
            }
            .total { 
              font-weight: 600; 
              color: #2e7d32; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 0.9rem; 
            }
            .qr-code-container {
              text-align: center;
              margin: 20px auto;
              display: flex;
              justify-content: center;
            }
            .qr-code {
              margin: 0 auto;
              padding: 10px;
              border: 1px solid #ddd;
              display: inline-block;
            }
            .section {
              
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            /* Adjust size of section titles */
            .MuiTypography-h6 {
              font-size: 1.3rem !important;
              font-weight: 600 !important;
              color: #303f9f !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>Bon Commande #${selectedCommande.id}</h1>
            
            <div class="section">
              <h2>Montant Total: ${formatCurrency(selectedCommande.montantTotale)}</h2>
            </div>
            
            <div class="section">
              ${infoCommande?.innerHTML || ''}
            </div>
            
            <div class="section">
              ${detailsFinanciers?.innerHTML || ''}
            </div>
            
            <div class="section">
              ${infoClient?.innerHTML || ''}
            </div>
            
            <div class="section qr-code-container">
              <div class="qr-code">
                ${qrCodeSection ? qrCodeSection.querySelector('.MuiBox-root svg')?.outerHTML || '' : ''}
              </div>
            </div>
            
            <div class="footer">
              Document généré le ${new Date().toLocaleDateString()}
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <>
      {selectedCommande ? (
        <CommandeDetails
          commande={selectedCommande}
          onBack={() => setSelectedCommande(null)}
          onPrint={handlePrint}
        />
      ) : (
        <CommandeList
          commandes={commandes}
          onAddCommande={() => {
            setCurrentCommande(null);
            setOpenDialog(true);
          }}
          onEditCommande={(commande: CommandeDTO) => {
            setCurrentCommande(commande);
            setOpenDialog(true);
          }}
          onDeleteCommande={confirmDelete}
          onViewDetails={handleViewDetails}
        />
      )}
      <CommandeForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={currentCommande || undefined}
        utilisateurs={utilisateurs}
        fournisseurs={fournisseurs}
      />
      <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
        <DialogTitle>Erreur de suppression</DialogTitle>
        <DialogContent>
          <Typography>{deleteError}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteErrorOpen(false)} color="primary" variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette commande ?</Typography>
          <Typography sx={{ mt: 2, color: 'warning.main' }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GestionCommande;
