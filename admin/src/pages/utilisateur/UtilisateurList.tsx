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
import UtilisateurTable from './UtilisateurTable';
import { Utilisateur } from './types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface UtilisateurListProps {
  utilisateurs: Utilisateur[];
  onAddUtilisateur: () => void;
  onEditUtilisateur: (utilisateur: Utilisateur) => void;
  onDeleteUtilisateur: () => void;
}

const UtilisateurList: React.FC<UtilisateurListProps> = ({
  utilisateurs,
  onAddUtilisateur,
  onEditUtilisateur,
  onDeleteUtilisateur,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredUtilisateurs = utilisateurs.filter((utilisateur) => {
    const searchFields = [
      utilisateur.nom.toLowerCase(),
      utilisateur.email.toLowerCase(),
      utilisateur.telephone.toLowerCase(),
      utilisateur.identifiant.toLowerCase(),
    ];
    return searchFields.some((field) => field.includes(searchTerm));
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gestion des Utilisateurs
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
            onClick={onAddUtilisateur}
          >
            Ajouter
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <UtilisateurTable
          utilisateurs={filteredUtilisateurs}
          onEditUtilisateur={onEditUtilisateur}
          onDeleteUtilisateur={onDeleteUtilisateur}
        />
      </Paper>
    </Container>
  );
};

export default UtilisateurList;
