import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FournisseurList from './FournisseurList';
import FournisseurForm from './FournisseurForm';
import { Fournisseur } from './types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';

const GestionFournisseur: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentFournisseur, setCurrentFournisseur] = useState<Fournisseur | null>(null);
  // Supprimer ces états si vous n'utilisez plus le dialogue d'erreur
  // const [deleteError, setDeleteError] = useState<string>('');
  // const [deleteErrorOpen, setDeleteErrorOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<number | null>(null);
  const [deleteWithCommandesOpen, setDeleteWithCommandesOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteResult, setDeleteResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs/liste`);
      // Ajout du tri par date de création (du plus récent au plus ancien)
      const sortedFournisseurs = response.data.sort(
        (a: Fournisseur, b: Fournisseur) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime(),
      );
      setFournisseurs(sortedFournisseurs);
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs :', error);
    }
  };

  const handleSave = async (fournisseurData: {
    nom: string;
    adresse: string;
    telephone: string;
    identifiant: string;
  }) => {
    try {
      if (currentFournisseur) {
        // Mise à jour - on conserve la date de création originale
        await axios.put(
          `${API_URL}/api/fournisseurs/modifier/${currentFournisseur.id}`,
          fournisseurData,
        );
      } else {
        // Création - on ajoute la date actuelle côté serveur
        await axios.post(`${API_URL}/api/fournisseurs/ajouter`, fournisseurData);
      }
      fetchFournisseurs();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur :', error);
    }
  };

  const confirmDelete = (id: number) => {
    setFournisseurToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteWithCommandes = async () => {
    if (!fournisseurToDelete) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_URL}/api/fournisseurs/supprimer-avec-commandes/${fournisseurToDelete}`,
      );

      // Fermer le dialogue de confirmation
      setDeleteConfirmOpen(false);

      // Afficher le résultat
      setDeleteResult({
        success: true,
        message: response.data.message,
        count: response.data.commandesCount,
      });

      // Rafraîchir la liste des fournisseurs
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur et ses commandes:', error);

      let errorMessage = 'Une erreur est survenue lors de la suppression.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setDeleteResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsDeleting(false);
      setDeleteWithCommandesOpen(true);
      setFournisseurToDelete(null);
    }
  };

  return (
    <>
      <FournisseurList
        fournisseurs={fournisseurs}
        onAddFournisseur={() => {
          setCurrentFournisseur(null);
          setOpenDialog(true);
        }}
        onEditFournisseur={(fournisseur: Fournisseur) => {
          setCurrentFournisseur(fournisseur);
          setOpenDialog(true);
        }}
        onDeleteFournisseur={confirmDelete}
      />
      <FournisseurForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={currentFournisseur || undefined}
      />
      {/* Supprimer ce dialogue d'erreur s'il n'est plus utilisé
      <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          Impossible de supprimer ce fournisseur
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{deleteError}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteErrorOpen(false);
              navigate('/commandes');
            }}
            color="primary"
          >
            Voir les commandes
          </Button>
          <Button onClick={() => setDeleteErrorOpen(false)} color="primary" variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      */}{' '}
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer ce fournisseur ?</Typography>
          <Typography sx={{ mt: 2, color: 'warning.main' }}>
            Cette action est irréversible et entraînera la suppression de toutes les commandes
            associées à ce fournisseur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteWithCommandes} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteWithCommandesOpen} onClose={() => setDeleteWithCommandesOpen(false)}>
        <DialogTitle sx={{ color: deleteResult?.success ? 'success.main' : 'error.main' }}>
          {deleteResult?.success ? 'Suppression réussie' : 'Erreur de suppression'}
        </DialogTitle>
        <DialogContent>
          {isDeleting ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          ) : (
            <Typography>
              {deleteResult?.success
                ? `${deleteResult.message}. ${deleteResult.count} commande(s) ont été supprimées.`
                : deleteResult?.message}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteWithCommandesOpen(false)}
            color="primary"
            variant="contained"
            disabled={isDeleting}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GestionFournisseur;
