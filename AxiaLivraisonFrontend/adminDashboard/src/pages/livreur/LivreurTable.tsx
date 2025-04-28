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
import { Utilisateur } from './types';

interface LivreurTableProps {
  livreurs: Utilisateur[];
  onEditLivreur: (livreur: Utilisateur) => void;
  onDeleteLivreur: (id: number) => void;
}

const LivreurTable: React.FC<LivreurTableProps> = ({
  livreurs,
  onEditLivreur,
  onDeleteLivreur,
}) => {
  return (
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
                    onClick={() => onDeleteLivreur(livreur.id)}
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

export default LivreurTable;
