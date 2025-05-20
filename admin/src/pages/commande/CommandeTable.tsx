import React from 'react';
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
import { CommandeDTO } from './types';

interface CommandeTableProps {
  commandes: CommandeDTO[];
  onEditCommande: (commande: CommandeDTO) => void;
  onDeleteCommande: (id: number) => void;
  onViewDetails: (id: number) => void;
  onLocateCommande: (id: number) => void;
}

const CommandeTable: React.FC<CommandeTableProps> = ({
  commandes,
  onEditCommande,
  onDeleteCommande,
  onViewDetails,
  onLocateCommande,
}) => {
  const formatDinar = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3, // Format standard pour le dinar tunisien
    }).format(value);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Livreur</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Fournisseur</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Montant (TND)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {commandes.map((commande) => (
            <TableRow
              key={commande.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{commande.statut}</TableCell>
              <TableCell>{commande.utilisateurIdentifiant}</TableCell>
              <TableCell>{commande.fournisseurIdentifiant}</TableCell>
              <TableCell>{commande.nomClient}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {formatDinar(commande.montantTotale)}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onEditCommande(commande)}
                    sx={{ textTransform: 'none' }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => commande.id && onDeleteCommande(commande.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    Supprimer
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => commande.id && onViewDetails(commande.id)}
                    sx={{
                      backgroundColor: '#ff9800',
                      '&:hover': { backgroundColor: '#f57c00' },
                      textTransform: 'none',
                    }}
                  >
                    Détails
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => commande.id && onLocateCommande(commande.id)}
                    sx={{
                      backgroundColor: '#2196f3',
                      '&:hover': { backgroundColor: '#1976d2' },
                      textTransform: 'none',
                    }}
                  >
                    Localiser
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CommandeTable;
