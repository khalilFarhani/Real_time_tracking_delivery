import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import logo from 'assets/images/logo.png';

const TrackingPage = () => {
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.Nom || '');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <img src={logo} alt="Logo" style={{ height: 80 }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Bienvenue {userName ? `${userName}` : ''} sur Axia Livraison
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Plateforme professionnelle de gestion et suivi de livraisons
        </Typography>

        <Alert
          severity="info"
          sx={{
            maxWidth: '500px',
            mx: 'auto',
            mt: 1,
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            '& .MuiAlert-icon': {
              color: 'primary.main',
            },
          }}
        >
          Vous n'avez actuellement aucun rôle ou permission attribué. Veuillez contacter votre
          administrateur pour obtenir l'accès aux fonctionnalités.
        </Alert>
      </Paper>

      <Divider sx={{ my: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Fonctionnalités de la plateforme
        </Typography>
      </Divider>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: 'primary.light',
              }}
            >
              <IconifyIcon
                icon="mdi:truck-delivery-outline"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Suivi de Livraisons
              </Typography>
              <Typography variant="body2">
                Suivez en temps réel l'état de vos livraisons et accédez à des informations
                détaillées.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: '#4caf50',
              }}
            >
              <IconifyIcon
                icon="mdi:clipboard-text-outline"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Gestion des Commandes
              </Typography>
              <Typography variant="body2">
                Créez, modifiez et suivez vos commandes avec un système complet de gestion.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: '#2196f3',
              }}
            >
              <IconifyIcon
                icon="mdi:account-hard-hat"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Gestion des Livreurs
              </Typography>
              <Typography variant="body2">
                Gérez votre équipe de livreurs et suivez leurs performances en temps réel.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: '#ff9800',
              }}
            >
              <IconifyIcon
                icon="mdi:store-outline"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Gestion des Fournisseurs
              </Typography>
              <Typography variant="body2">
                Maintenez une base de données complète de vos fournisseurs et optimisez vos
                relations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: '#9c27b0',
              }}
            >
              <IconifyIcon
                icon="mdi:currency-usd"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Gestion Financière
              </Typography>
              <Typography variant="body2">
                Suivez vos revenus, gérez vos factures et analysez la rentabilité de votre activité.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: '40%',
                position: 'relative',
                bgcolor: 'success.light',
              }}
            >
              <IconifyIcon
                icon="mdi:chart-timeline-variant"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 50,
                  color: 'white',
                }}
              />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography gutterBottom variant="h6" component="h2">
                Rapports et Analyses
              </Typography>
              <Typography variant="body2">
                Accédez à des rapports détaillés pour prendre des décisions éclairées pour votre
                entreprise.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Guide d'utilisation
        </Typography>
      </Divider>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(33, 150, 243, 0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconifyIcon
                icon="mdi:account-search"
                color="primary.main"
                fontSize={24}
                sx={{ mr: 1 }}
              />
              <Typography variant="h6" color="primary.main">
                Pour les Clients
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Comment suivre vos livraisons en temps réel:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-1-circle" color="primary.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Connectez-vous à votre compte"
                  secondary="Utilisez vos identifiants fournis par l'administrateur"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-2-circle" color="primary.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Accédez à la section 'Suivi de Livraisons'"
                  secondary="Vous y trouverez la liste de toutes vos commandes en cours"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-3-circle" color="primary.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Consultez les détails d'une commande"
                  secondary="Cliquez sur une commande pour voir sa position GPS, son statut et l'heure estimée d'arrivée"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-4-circle" color="primary.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Recevez des notifications"
                  secondary="Des alertes vous informent à chaque changement de statut de votre commande"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: 'rgba(76, 175, 80, 0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconifyIcon
                icon="mdi:truck-delivery"
                color="success.main"
                fontSize={24}
                sx={{ mr: 1 }}
              />
              <Typography variant="h6" color="success.main">
                Pour les Livreurs
              </Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Comment gérer vos livraisons efficacement:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-1-circle" color="success.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Consultez vos livraisons assignées"
                  secondary="Accédez à votre tableau de bord pour voir les commandes qui vous sont attribuées"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-2-circle" color="success.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Mettez à jour le statut des commandes"
                  secondary="Changez le statut à chaque étape: Prise en charge, En transit, Livré, etc."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-3-circle" color="success.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Utilisez la navigation GPS intégrée"
                  secondary="Suivez l'itinéraire optimal pour vos livraisons"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-4-circle" color="success.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Collectez les signatures"
                  secondary="Utilisez l'application pour recueillir la signature du client à la livraison"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <IconifyIcon icon="mdi:numeric-5-circle" color="success.main" fontSize={20} />
                </ListItemIcon>
                <ListItemText
                  primary="Signalez les problèmes"
                  secondary="En cas de difficulté, utilisez la fonction de signalement pour alerter le support"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TrackingPage;
