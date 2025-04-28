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
import { Permission } from './types';

interface PermissionTableProps {
  permissions: Permission[];
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (id: number) => void;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  onEditPermission,
  onDeletePermission,
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow
              key={permission.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{permission.permissionName}</TableCell>
              <TableCell>{permission.description}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onEditPermission(permission)}
                    sx={{ textTransform: 'none' }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => onDeletePermission(permission.id)}
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

export default PermissionTable;
