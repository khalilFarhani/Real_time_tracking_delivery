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
} from '@mui/material';
import axios from 'axios';
import { Utilisateur } from './types';
import GestionPermissionsUtilisateur from '../permission/GestionPermissionsUtilisateur';

interface UtilisateurTableProps {
  utilisateurs: Utilisateur[];
  onEditUtilisateur: (utilisateur: Utilisateur) => void;
  onDeleteUtilisateur: (id: number) => void;
}

const UtilisateurTable: React.FC<UtilisateurTableProps> = ({
  utilisateurs,
  onEditUtilisateur,
  onDeleteUtilisateur,
}) => {
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<Utilisateur | null>(null);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
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
                      onClick={() => onDeleteUtilisateur(utilisateur.id)}
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
    </>
  );
};

export default UtilisateurTable;
