import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Utilisateur } from './types';
import GestionPermissionsUtilisateur from '../permission/GestionPermissionsUtilisateur';

interface UtilisateurTableProps {
  utilisateurs: Utilisateur[];
  onEditUtilisateur: (utilisateur: Utilisateur) => void;
  onDeleteUtilisateur: () => void;
}

const UtilisateurTable: React.FC<UtilisateurTableProps> = ({
  utilisateurs,
  onEditUtilisateur,
  onDeleteUtilisateur,
}) => {
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<Utilisateur | null>(null);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [utilisateurToDelete, setUtilisateurToDelete] = useState<number | null>(null);
  const API_URL = 'http://localhost:5283';

  const handleSavePermissions = async (utilisateurId: number, permissionIds: number[]) => {
    try {
      await axios.post(`${API_URL}/api/permissions/assigner`, {
        utilisateurId,
        permissionIds,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des permissions:', error);
    }
  };

  const handleDelete = async (id: number, force: boolean = false) => {
    try {
      const endpoint = force
        ? `${API_URL}/api/utilisateurs/supprimer-force/${id}`
        : `${API_URL}/api/utilisateurs/supprimer/${id}`;

      await axios.delete(endpoint);
      onDeleteUtilisateur();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);

      // Show error dialog with details
      if (axios.isAxiosError(error) && error.response) {
        let errorMsg = "Une erreur est survenue lors de la suppression de l'utilisateur.";

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
    setUtilisateurToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (utilisateurToDelete) {
      await handleDelete(utilisateurToDelete, false);
      setUtilisateurToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleForceDelete = async () => {
    if (utilisateurToDelete) {
      await handleDelete(utilisateurToDelete, true);
      setUtilisateurToDelete(null);
    }
    setDeleteErrorOpen(false);
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Identifiant</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {utilisateurs.map((utilisateur) => (
              <TableRow
                key={utilisateur.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  {utilisateur.imagePath && (
                    <img
                      src={`${API_URL}${utilisateur.imagePath}`}
                      alt={utilisateur.nom}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{utilisateur.nom}</TableCell>
                <TableCell>{utilisateur.email}</TableCell>
                <TableCell>{utilisateur.telephone}</TableCell>
                <TableCell>{utilisateur.identifiant}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onEditUtilisateur(utilisateur)}
                      sx={{ textTransform: 'none' }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => confirmDelete(utilisateur.id)}
                      sx={{ textTransform: 'none' }}
                    >
                      Supprimer
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setSelectedUtilisateur(utilisateur);
                        setOpenPermissionsDialog(true);
                      }}
                      sx={{
                        backgroundColor: '#ff9800',
                        '&:hover': { backgroundColor: '#f57c00' },
                        textTransform: 'none',
                      }}
                    >
                      Permissions
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedUtilisateur && (
        <GestionPermissionsUtilisateur
          utilisateur={selectedUtilisateur}
          open={openPermissionsDialog}
          onClose={() => setOpenPermissionsDialog(false)}
          onSave={handleSavePermissions}
        />
      )}

      {/* Dialog d'erreur de suppression */}
      <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
        <DialogTitle>Suppression avec données associées</DialogTitle>
        <DialogContent>
          <Typography>{deleteError}</Typography>
          <Typography sx={{ mt: 2, color: 'warning.main' }}>
            ⚠️ Attention : Supprimer cet utilisateur supprimera également toutes ses commandes et
            rapports associés. Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteErrorOpen(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleForceDelete} color="error" variant="contained">
            Supprimer quand même
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Typography>
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

export default UtilisateurTable;
