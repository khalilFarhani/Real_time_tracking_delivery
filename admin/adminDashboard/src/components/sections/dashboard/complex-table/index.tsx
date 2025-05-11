import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Pagination,
  CircularProgress,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import TableContent from './TableContent';
import axios from 'axios';
import { Commande } from 'types/commande';

const ComplexTable = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 4;

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Commande[]>('http://localhost:5283/api/commandes/liste');
      setCommandes(response.data);
      setFilteredCommandes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);

    if (value) {
      const filtered = commandes.filter((commande) => {
        return (
          commande.nomClient?.toLowerCase().includes(value) ||
          commande.statut?.toLowerCase().includes(value) ||
          commande.id.toString().includes(value)
        );
      });
      setFilteredCommandes(filtered);
    } else {
      setFilteredCommandes(commandes);
    }
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedData = filteredCommandes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        boxShadow: '0px 3px 14px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
      }}
    >
      <Stack
        px={2}
        pb={2}
        spacing={{ xs: 2, sm: 0 }}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant="h5"
          textAlign={{ xs: 'center', sm: 'left' }}
          fontWeight="600"
          color="#333"
        >
          Commandes Récentes
        </Typography>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Rechercher..."
          value={searchText}
          onChange={handleInputChange}
          sx={{
            mx: { xs: 'auto', sm: 'initial' },
            width: 1,
            maxWidth: { xs: 300, sm: 220 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="eva:search-fill" color="#666" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box sx={{ mt: 1, px: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <TableContent data={paginatedData} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
              <Pagination
                count={Math.ceil(filteredCommandes.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="medium"
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ComplexTable;
