import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  InputAdornment,
  Grid,
} from '@mui/material';
import FournisseurTable from './FournisseurTable';
import { Fournisseur } from './types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface FournisseurListProps {
  fournisseurs: Fournisseur[];
  onAddFournisseur: () => void;
  onEditFournisseur: (fournisseur: Fournisseur) => void;
  onDeleteFournisseur: (id: number) => void;
}

const FournisseurList: React.FC<FournisseurListProps> = ({
  fournisseurs,
  onAddFournisseur,
  onEditFournisseur,
  onDeleteFournisseur,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    const searchFields = [
      fournisseur.nom.toLowerCase(),
      fournisseur.adresse.toLowerCase(),
      fournisseur.telephone.toLowerCase(),
      fournisseur.identifiant.toLowerCase(),
    ];
    return searchFields.some((field) => field.includes(searchTerm));
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gestion des Fournisseurs
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={10}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderWidth: '1px',
                  borderStyle: 'solid',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '0px',
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
              height: '40px',
              textTransform: 'none',
            }}
            startIcon={<AddIcon />}
            onClick={onAddFournisseur}
          >
            Ajouter
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <FournisseurTable
          fournisseurs={filteredFournisseurs}
          onEditFournisseur={onEditFournisseur}
          onDeleteFournisseur={onDeleteFournisseur}
        />
      </Paper>
    </Container>
  );
};

export default FournisseurList;
