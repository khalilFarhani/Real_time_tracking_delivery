import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Commande } from 'types/commande';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface TableContentProps {
  data: Commande[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'livré':
      return 'success';
    case 'en transit':
      return 'warning';
    case 'en préparation':
      return 'error'; // Rouge pour "en préparation"
    default:
      return 'default';
  }
};

const formatDate = (date: string) => {
  try {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error, date);
    return 'Date invalide';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
  }).format(amount);
};

const TableContent: React.FC<TableContentProps> = ({ data }) => {
  const navigate = useNavigate();

  const handleViewDetails = (id: number) => {
    navigate(`/app/commande/details/${id}`);
  };

  const handleLocateCommande = (event: React.MouseEvent, id: number) => {
    event.stopPropagation(); // Empêche le déclenchement du onClick de la ligne
    navigate(`/app/commande/map/${id}`);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                ID
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Client
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Téléphone
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Statut
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Quantité
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Montant
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" color="text.secondary">
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                cursor: 'pointer',
              }}
              onClick={() => handleViewDetails(row.id)}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  #{row.id}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.nomClient}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.telephoneClient || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={row.statut}
                  color={getStatusColor(row.statut)}
                  size="small"
                  variant="filled"
                  sx={{
                    fontWeight: 500,
                    borderRadius: '12px',
                    textTransform: 'capitalize',
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {row.dateCreation ? formatDate(row.dateCreation) : '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} align="center">
                  {row.quantite}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                  {formatCurrency(row.montantTotale)}
                </Typography>
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e: React.MouseEvent) => handleLocateCommande(e, row.id)}
                  startIcon={<LocationOnIcon />}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1,
                  }}
                >
                  Localiser
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableContent;
