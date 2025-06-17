import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

interface AdminOnlyGuardProps {
  children: React.ReactNode;
}

const AdminOnlyGuard: React.FC<AdminOnlyGuardProps> = ({ children }) => {
  const userStr = localStorage.getItem('user');

  if (!userStr) {
    // Si pas d'utilisateur connecté, rediriger vers la connexion
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Si l'utilisateur n'est pas admin (EstAdmin = false), afficher un message d'erreur
    if (!user.EstAdmin) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Accès Refusé
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cette section est réservée aux administrateurs principaux uniquement.
            </Typography>
          </Paper>
        </Box>
      );
    }

    // Si l'utilisateur est admin, afficher le contenu
    return <>{children}</>;
  } catch (error) {
    // Si erreur de parsing, rediriger vers la connexion
    console.error('Erreur lors de la lecture des données utilisateur:', error);
    return <Navigate to="/" replace />;
  }
};

export default AdminOnlyGuard;
