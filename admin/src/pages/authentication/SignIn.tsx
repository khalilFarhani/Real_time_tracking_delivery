import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled, keyframes } from '@mui/material/styles';
import { Card, CardContent, Container, GlobalStyles } from '@mui/material';
import paths from 'routes/paths';
import sitemap, { MenuItem } from 'routes/sitemap';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
// Import the logo
import logo from 'assets/images/logo.png';
import { authService } from 'services/authService';
import type { AxiosErrorResponse } from 'types/api';

interface User {
  identifiant: string;
  password: string;
}

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(5px) rotate(-1deg); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Global styles for background effects
const globalStyles = (
  <GlobalStyles
    styles={{
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '33%': { transform: 'translateY(-10px) rotate(1deg)' },
        '66%': { transform: 'translateY(5px) rotate(-1deg)' },
      },
      '@keyframes shimmer': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.8 },
      },
      '@keyframes slideIn': {
        from: {
          opacity: 0,
          transform: 'translateY(30px) scale(0.95)',
        },
        to: {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
        },
      },
      '@keyframes rotate': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    }}
  />
);

// Styled components
const LoginContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: `
    linear-gradient(135deg,
      rgba(67, 24, 255, 0.1) 0%,
      rgba(4, 190, 254, 0.1) 25%,
      rgba(147, 51, 234, 0.1) 50%,
      rgba(16, 185, 129, 0.1) 75%,
      rgba(249, 115, 22, 0.1) 100%
    )`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(67, 24, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(4, 190, 254, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 60% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
    zIndex: -2,
    animation: `${float} 8s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'fixed',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `
      conic-gradient(from 0deg at 50% 50%,
        transparent 0deg,
        rgba(67, 24, 255, 0.03) 60deg,
        transparent 120deg,
        rgba(4, 190, 254, 0.03) 180deg,
        transparent 240deg,
        rgba(147, 51, 234, 0.03) 300deg,
        transparent 360deg
      )
    `,
    pointerEvents: 'none',
    zIndex: -1,
    animation: `${rotate} 60s linear infinite`,
  },
}));

const LoginCard = styled(Card)(() => ({
  maxWidth: 500,
  width: '100%',
  margin: '0 auto',
  background: `
    linear-gradient(145deg,
      rgba(255, 255, 255, 0.95),
      rgba(248, 250, 252, 0.9)
    )`,
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  boxShadow: `
    0 25px 50px rgba(0, 0, 0, 0.1),
    0 15px 35px rgba(67, 24, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideIn} 0.8s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `
      linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      )`,
    animation: `${shimmer} 3s ease-in-out infinite`,
    pointerEvents: 'none',
  },
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(67, 24, 255, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      border: '2px solid rgba(67, 24, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(67, 24, 255, 0.15)',
    },
    '&.Mui-focused': {
      border: '2px solid rgba(67, 24, 255, 0.4)',
      background: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 35px rgba(67, 24, 255, 0.2)',
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px 20px',
    fontSize: '1rem',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(67, 24, 255, 0.7)',
    fontWeight: 600,
    '&.Mui-focused': {
      color: 'rgba(67, 24, 255, 1)',
    },
  },
}));

const LoginButton = styled(Button)(() => ({
  height: '56px',
  borderRadius: '16px',
  background: `
    linear-gradient(135deg,
      #4318FF 0%,
      #04BEFE 50%,
      #9333ea 100%
    )`,
  color: 'white',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `
    0 8px 25px rgba(67, 24, 255, 0.3),
    0 4px 15px rgba(4, 190, 254, 0.2)
  `,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `
      linear-gradient(90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      )`,
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: `
      0 15px 40px rgba(67, 24, 255, 0.4),
      0 8px 25px rgba(4, 190, 254, 0.3)
    `,
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'translateY(-1px) scale(1.01)',
  },
  '&:disabled': {
    background: 'rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.26)',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const SignIn = () => {
  const [user, setUser] = useState<User>({ identifiant: '', password: '' });
  const [btnPosition, setBtnPosition] = useState({ x: 0, y: 0 });
  const [preventClick, setPreventClick] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const authResponse = await authService.login({
        Identifiant: user.identifiant,
        MotDePasse: user.password,
      });

      // Check if user is a livreur
      if (authResponse.estLivreur) {
        setErrorMessage(
          "Les livreurs ne peuvent pas accéder à cette application. Veuillez utiliser l'application dédiée aux livreurs.",
        );
        setDialogOpen(true);
        await authService.logout(); // Clear any stored tokens
        return;
      }

      // Determine where to redirect based on permissions
      if (authResponse.estAdmin) {
        navigate(paths.dashboard);
      } else if (authResponse.permissions && authResponse.permissions.length > 0) {
        // Find the first permission that matches a route
        const availableRoutes = sitemap.filter((route: MenuItem) =>
          authResponse.permissions?.some((p) => p.permissionName === route.subheader),
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
    } catch (error: unknown) {
      console.error('Erreur de connexion:', error);

      let errorMsg = 'Erreur de connexion au serveur';

      const axiosError = error as AxiosErrorResponse;
      if (axiosError.response?.data) {
        if (typeof axiosError.response.data === 'string') {
          errorMsg = axiosError.response.data;
        } else if (axiosError.response.data.message) {
          errorMsg = axiosError.response.data.message;
        }
      } else if (axiosError.message) {
        errorMsg = axiosError.message;
      }

      setErrorMessage(errorMsg);
      setDialogOpen(true);
    } finally {
      setLoading(false);
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
    <>
      {globalStyles}
      <LoginContainer>
        <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          <LoginCard>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                    borderRadius: '24px',
                    background: `
                      linear-gradient(135deg,
                        rgba(67, 24, 255, 0.1),
                        rgba(4, 190, 254, 0.1)
                      )`,
                    border: '2px solid rgba(67, 24, 255, 0.1)',
                    mb: 3,
                    animation: `${float} 3s ease-in-out infinite`,
                  }}
                >
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      height: 60,
                      width: 'auto',
                      filter: 'drop-shadow(0 4px 8px rgba(67, 24, 255, 0.2))',
                    }}
                  />
                </Box>

                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    background: `
                      linear-gradient(135deg,
                        #4318FF 0%,
                        #04BEFE 50%,
                        #9333ea 100%
                      )`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Bienvenue
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Connectez-vous à votre espace personnel
                </Typography>
              </Box>

              {/* Form Section */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Stack direction="column" spacing={3} sx={{ width: '100%' }}>
                  <StyledTextField
                    sx={{ marginTop: 3 }}
                    fullWidth
                    id="identifiant"
                    name="identifiant"
                    label="Identifiant"
                    type="text"
                    value={user.identifiant}
                    onChange={handleInputChange}
                    placeholder="Identifiant"
                    autoComplete="username"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon
                            sx={{
                              color: 'rgba(67, 24, 255, 0.6)',
                              mr: 1,
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <StyledTextField
                    sx={{ marginTop: 3 }}
                    fullWidth
                    id="password"
                    name="password"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    value={user.password}
                    onChange={handleInputChange}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon
                            sx={{
                              color: 'rgba(67, 24, 255, 0.6)',
                              mr: 1,
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{
                              color: 'rgba(67, 24, 255, 0.6)',
                              '&:hover': {
                                color: 'rgba(67, 24, 255, 0.8)',
                                background: 'rgba(67, 24, 255, 0.1)',
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    onMouseEnter={shiftButtonIfEmpty}
                    sx={{
                      transition: 'transform 0.3s ease-in-out',
                      transform: `translate(${btnPosition.x}px, ${btnPosition.y}px)`,
                      mt: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <LoginButton
                      type="submit"
                      disabled={loading}
                      sx={{
                        pointerEvents: preventClick || loading ? 'none' : 'auto',
                        width: '60%',
                        minWidth: '200px',
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress
                            size={24}
                            sx={{
                              color: 'white',
                              animation: `${pulse} 1.5s ease-in-out infinite`,
                            }}
                          />
                          <Typography variant="inherit" fontWeight={600}>
                            Connexion en cours...
                          </Typography>
                        </Box>
                      ) : (
                        'Se connecter'
                      )}
                    </LoginButton>
                  </Box>
                </Stack>
              </Box>

              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    opacity: 0.7,
                  }}
                >
                  © {new Date().getFullYear()} Tous droits réservés
                </Typography>
              </Box>
            </CardContent>
          </LoginCard>
        </Container>
      </LoginContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: `
              linear-gradient(145deg,
                rgba(255, 255, 255, 0.95),
                rgba(248, 250, 252, 0.9)
              )`,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.15),
              0 15px 35px rgba(239, 68, 68, 0.1)
            `,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            textAlign: 'center',
            pb: 1,
            pt: 3,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: `
                linear-gradient(135deg,
                  rgba(239, 68, 68, 0.1),
                  rgba(220, 38, 38, 0.1)
                )`,
              border: '2px solid rgba(239, 68, 68, 0.2)',
              mb: 2,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            <Typography variant="h4">⚠️</Typography>
          </Box>
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              background: `
                linear-gradient(135deg,
                  #ef4444 0%,
                  #dc2626 100%
                )`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Accès refusé
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', px: 3 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.7)',
              lineHeight: 1.6,
            }}
          >
            {errorMessage}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            onClick={handleCloseDialog}
            autoFocus
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              background: `
                linear-gradient(135deg,
                  #ef4444 0%,
                  #dc2626 100%
                )`,
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: `
                  linear-gradient(135deg,
                    #dc2626 0%,
                    #b91c1c 100%
                  )`,
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignIn;
