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
import LivreurTable from './LivreurTable';
import { Utilisateur } from './types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface LivreurListProps {
  livreurs: Utilisateur[];
  onAddLivreur: () => void;
  onEditLivreur: (livreur: Utilisateur) => void;
  onDeleteLivreur: () => void;
}

const LivreurList: React.FC<LivreurListProps> = ({
  livreurs,
  onAddLivreur,
  onEditLivreur,
  onDeleteLivreur,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredLivreurs = livreurs.filter((livreur) => {
    const searchFields = [
      livreur.nom.toLowerCase(),
      livreur.email.toLowerCase(),
      livreur.telephone.toLowerCase(),
      livreur.identifiant.toLowerCase(),
    ];
    return searchFields.some((field) => field.includes(searchTerm));
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gestion des Livreurs
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
            onClick={onAddLivreur}
          >
            Ajouter
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <LivreurTable
          livreurs={filteredLivreurs}
          onEditLivreur={onEditLivreur}
          onDeleteLivreur={onDeleteLivreur}
        />
      </Paper>
    </Container>
  );
};

export default LivreurList;
