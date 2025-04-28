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
import CommandeTable from './CommandeTable';
import { CommandeDTO } from './types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Utility function to format numbers as dinar
const formatDinar = (amount: number): string => {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
};

interface CommandeListProps {
  commandes: CommandeDTO[];
  onAddCommande: () => void;
  onEditCommande: (commande: CommandeDTO) => void;
  onDeleteCommande: (id: number) => void;
  onViewDetails: (id: number) => void;
}

const CommandeList: React.FC<CommandeListProps> = ({
  commandes,
  onAddCommande,
  onEditCommande,
  onDeleteCommande,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredCommandes = commandes.filter((commande) => {
    const searchFields = [
      commande.statut?.toLowerCase() || '',
      commande.utilisateurIdentifiant?.toLowerCase() || '',
      commande.fournisseurIdentifiant?.toLowerCase() || '',
      commande.nomClient?.toLowerCase() || '',
      formatDinar(commande.montantTotale)?.toString().toLowerCase() || '',
    ];
    return searchFields.some((field) => field.includes(searchTerm));
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gestion des Commandes
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
            onClick={onAddCommande}
          >
            Ajouter
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <CommandeTable
          commandes={filteredCommandes}
          onEditCommande={onEditCommande}
          onDeleteCommande={onDeleteCommande}
          onViewDetails={onViewDetails}
        />
      </Paper>
    </Container>
  );
};

export default CommandeList;
