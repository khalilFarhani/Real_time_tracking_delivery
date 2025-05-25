import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from 'services/authService';
import { rootPaths } from 'routes/paths';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get a valid token (this will refresh if needed)
          const token = await authService.getValidToken();
          if (token) {
            setIsAuthenticated(true);
          } else {
            // Token refresh failed, redirect to login
            navigate(rootPaths.root);
          }
        } else {
          // Not authenticated, redirect to login
          navigate(rootPaths.root);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate(rootPaths.root);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Vérification de l'authentification...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default AuthGuard;
