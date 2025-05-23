import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';
import paths from 'routes/paths';
import sitemap, { MenuItem } from 'routes/sitemap';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
// Import the logo
import logo from 'assets/images/logo.png';

interface User {
  identifiant: string;
  password: string;
}

interface UserData {
  Id: string;
  Nom: string;
  Email: string;
  ImagePath: string;
  EstAdmin: boolean;
  EstLivreur: boolean;
  Permissions?: {
    permissionName: string;
    description?: string;
  }[];
}

const CompactTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    height: '40px',
    '& fieldset': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor:
        theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '0px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
    color: theme.palette.error.main,
  },
}));

const FormFieldContainer = styled(Box)({
  marginBottom: '16px',
});

const FieldLabel = styled(Typography)({
  marginBottom: '4px',
  fontWeight: 500,
  fontSize: '0.8rem',
});

const SignIn = () => {
  const [user, setUser] = useState<User>({ identifiant: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [btnPosition, setBtnPosition] = useState({ x: 0, y: 0 });
  const [preventClick, setPreventClick] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });

    // Reset position if both fields are filled
    if (e.target.value && user.identifiant && user.password) {
      setBtnPosition({ x: 0, y: 0 });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5283/api/authentification/connexion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Identifiant: user.identifiant,
          MotDePasse: user.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is a livreur
        if (data.estLivreur) {
          setErrorMessage(
            "Les livreurs ne peuvent pas accéder à cette application. Veuillez utiliser l'application dédiée aux livreurs.",
          );
          setDialogOpen(true);
          return;
        }

        const userData: UserData = {
          Id: data.userId,
          Nom: data.nom,
          Email: data.email,
          ImagePath: data.imagePath,
          EstAdmin: data.estAdmin,
          EstLivreur: data.estLivreur,
          Permissions: data.permissions,
        };

        localStorage.setItem('user', JSON.stringify(userData));

        // Determine where to redirect based on permissions
        if (userData.EstAdmin) {
          navigate(paths.dashboard);
        } else if (userData.Permissions && userData.Permissions.length > 0) {
          // Find the first permission that matches a route
          const availableRoutes = sitemap.filter((route: MenuItem) =>
            userData.Permissions?.some((p) => p.permissionName === route.subheader),
          );

          if (availableRoutes.length > 0) {
            navigate(availableRoutes[0].path || paths.tracking);
          } else {
            navigate(paths.tracking); // Fallback to tracking page
          }
        } else {
          // No permissions, go to tracking page
          navigate(paths.tracking);
        }
      } else {
        setErrorMessage(data.message || 'Erreur de connexion');
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage('Erreur lors de la connexion');
      setDialogOpen(true);
    }
  };

  const shiftButtonIfEmpty = () => {
    if (!user.identifiant || !user.password) {
      setPreventClick(true);

      // Random close movement: max ±100px
      const randomX = Math.floor(Math.random() * 200) - 100; // -100 to +100
      const randomY = Math.floor(Math.random() * 200) - 100; // -100 to +100

      setBtnPosition({ x: randomX, y: randomY });

      setTimeout(() => setPreventClick(false), 300); // match transition
    } else {
      setBtnPosition({ x: 0, y: 0 });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Stack
      mx="auto"
      width={400}
      height="100vh"
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={4}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <img src={logo} alt="Logo" style={{ height: 120, marginBottom: 16 }} />
        <Typography variant="h4" fontWeight={600} color="primary.main">
          Connexion
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Accédez à votre espace personnel
        </Typography>
      </Box>

      <Box width={1}>
        <Box component="form" onSubmit={handleSubmit}>
          <FormFieldContainer>
            <FieldLabel>Identifiant *</FieldLabel>
            <CompactTextField
              fullWidth
              id="identifiant"
              name="identifiant"
              type="text"
              value={user.identifiant}
              onChange={handleInputChange}
              placeholder="Votre identifiant"
              autoComplete="username"
              required
            />
          </FormFieldContainer>

          <FormFieldContainer>
            <FieldLabel>Mot de passe *</FieldLabel>
            <CompactTextField
              fullWidth
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={user.password}
              onChange={handleInputChange}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormFieldContainer>

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label="Rester connecté"
            sx={{ mb: 3, display: 'block', '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />

          <Box
            onMouseEnter={shiftButtonIfEmpty}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              transition: 'transform 0.3s ease-in-out',
              transform: `translate(${btnPosition.x}px, ${btnPosition.y}px)`,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{
                py: 1.5,
                fontSize: '0.875rem',
                textTransform: 'none',
                pointerEvents: preventClick ? 'none' : 'auto',
                boxShadow: 'none',
              }}
            >
              Se connecter
            </Button>
          </Box>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Tous droits réservés
      </Typography>

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
    </Stack>
  );
};

export default SignIn;
