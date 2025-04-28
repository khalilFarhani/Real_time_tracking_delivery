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
import PermissionTable from './PermissionTable';
import { Permission } from './types';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface PermissionListProps {
  permissions: Permission[];
  onAddPermission: () => void;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (id: number) => void;
}

const PermissionList: React.FC<PermissionListProps> = ({
  permissions,
  onAddPermission,
  onEditPermission,
  onDeletePermission,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredPermissions = permissions.filter((permission) => {
    const matchesName = permission.permissionName.toLowerCase().includes(searchTerm);
    const matchesDescription = permission.description.toLowerCase().includes(searchTerm);
    return matchesName || matchesDescription;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gestion des Permissions
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
            onClick={onAddPermission}
          >
            Ajouter
          </Button>
        </Grid>
      </Grid>

      <Paper elevation={0}>
        <PermissionTable
          permissions={filteredPermissions}
          onEditPermission={onEditPermission}
          onDeletePermission={onDeletePermission}
        />
      </Paper>
    </Container>
  );
};

export default PermissionList;
