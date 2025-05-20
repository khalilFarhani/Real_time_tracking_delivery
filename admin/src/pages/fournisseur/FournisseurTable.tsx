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
import { Fournisseur } from './types';

interface FournisseurTableProps {
  fournisseurs: Fournisseur[];
  onEditFournisseur: (fournisseur: Fournisseur) => void;
  onDeleteFournisseur: (id: number) => void;
}

const FournisseurTable: React.FC<FournisseurTableProps> = ({
  fournisseurs,
  onEditFournisseur,
  onDeleteFournisseur,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Adresse</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Identifiant</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fournisseurs.map((fournisseur) => (
            <TableRow
              key={fournisseur.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{fournisseur.nom}</TableCell>
              <TableCell>{fournisseur.adresse}</TableCell>
              <TableCell>{fournisseur.telephone}</TableCell>
              <TableCell>{fournisseur.identifiant}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onEditFournisseur(fournisseur)}
                    sx={{ textTransform: 'none' }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => onDeleteFournisseur(fournisseur.id)}
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
  );
};

export default FournisseurTable;
