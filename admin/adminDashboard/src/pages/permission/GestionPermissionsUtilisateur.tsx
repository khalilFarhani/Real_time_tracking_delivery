import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Permission } from './types';
import { Utilisateur } from '../utilisateur/types';

interface GestionPermissionsUtilisateurProps {
  utilisateur: Utilisateur;
  open: boolean;
  onClose: () => void;
  onSave: (utilisateurId: number, permissionIds: number[]) => void;
}

const GestionPermissionsUtilisateur: React.FC<GestionPermissionsUtilisateurProps> = ({
  utilisateur,
  open,
  onClose,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const allPermissions = await axios.get<Permission[]>(`${API_URL}/api/permissions/liste`);
        setPermissions(allPermissions.data);

        const userPermissions = await axios.get<Permission[]>(
          `${API_URL}/api/permissions/utilisateur/${utilisateur.id}`,
        );
        setSelectedPermissions(userPermissions.data.map((p) => p.id));
      } catch (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
      }
    };

    if (open) {
      fetchPermissions();
    }
  }, [open, utilisateur.id]);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSave = () => {
    onSave(utilisateur.id, selectedPermissions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gestion des Permissions pour {utilisateur.nom}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Sélectionnez les permissions à attribuer à cet utilisateur:
        </Typography>
        <List>
          {permissions.map((permission) => (
            <ListItem key={permission.id}>
              <Checkbox
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => handleTogglePermission(permission.id)}
              />
              <ListItemText
                primary={permission.permissionName}
                secondary={permission.description}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Annuler
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GestionPermissionsUtilisateur;
