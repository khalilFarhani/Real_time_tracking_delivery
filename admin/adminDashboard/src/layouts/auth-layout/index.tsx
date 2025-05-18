import { Outlet, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { rootPaths } from 'routes/paths';

interface AuthLayoutProps {
  children?: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // If user is a livreur, log them out
      if (user.EstLivreur) {
        localStorage.removeItem('user');
        setErrorMessage(
          "Les livreurs ne peuvent pas accéder à cette application. Veuillez utiliser l'application dédiée aux livreurs.",
        );
        setDialogOpen(true);
      } else {
        navigate(rootPaths.appRoot); // Redirect to app if user is not a livreur
      }
    }
  }, [navigate]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{ minHeight: '100vh' }}
      >
        {children || <Outlet />}
      </Stack>

      {/* Error Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Accès refusé'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthLayout;
