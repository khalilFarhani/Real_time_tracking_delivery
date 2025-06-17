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

interface LivreurTableProps {
  livreurs: Utilisateur[];
  onEditLivreur: (livreur: Utilisateur) => void;
  onDeleteLivreur: () => void;
}

const LivreurTable: React.FC<LivreurTableProps> = ({
  livreurs,
  onEditLivreur,
  onDeleteLivreur,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [livreurToDelete, setLivreurToDelete] = useState<number | null>(null);
  const API_URL = 'http://localhost:5283';

  const handleDelete = async (id: number, force: boolean = false) => {
    try {
      const endpoint = force
        ? `${API_URL}/api/utilisateurs/supprimer-force/${id}`
        : `${API_URL}/api/utilisateurs/supprimer/${id}`;

      await axios.delete(endpoint);
      onDeleteLivreur();
    } catch (error) {
      console.error('Erreur lors de la suppression du livreur :', error);

      // Show error dialog with details
      if (axios.isAxiosError(error) && error.response) {
        let errorMsg = 'Une erreur est survenue lors de la suppression du livreur.';

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
    setLivreurToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (livreurToDelete) {
      await handleDelete(livreurToDelete, false);
      setLivreurToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleForceDelete = async () => {
    if (livreurToDelete) {
      await handleDelete(livreurToDelete, true);
      setLivreurToDelete(null);
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
            {livreurs.map((livreur) => (
              <TableRow
                key={livreur.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  {livreur.imagePath && (
                    <img
                      src={`http://localhost:5283${livreur.imagePath}`}
                      alt={livreur.nom}
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                  )}
                </TableCell>
                <TableCell>{livreur.nom}</TableCell>
                <TableCell>{livreur.email}</TableCell>
                <TableCell>{livreur.telephone}</TableCell>
                <TableCell>{livreur.identifiant}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onEditLivreur(livreur)}
                      sx={{ textTransform: 'none' }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => confirmDelete(livreur.id)}
                      sx={{ textTransform: 'none' }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'erreur de suppression */}
      <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
        <DialogTitle>Suppression avec données associées</DialogTitle>
        <DialogContent>
          <Typography>{deleteError}</Typography>
          <Typography sx={{ mt: 2, color: 'warning.main' }}>
            {/* eslint-disable-next-line prettier/prettier */}
            ⚠️ Attention : Supprimer ce livreur supprimera également toutes ses commandes et
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
          <Typography>Êtes-vous sûr de vouloir supprimer ce livreur ?</Typography>
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

export default LivreurTable;
