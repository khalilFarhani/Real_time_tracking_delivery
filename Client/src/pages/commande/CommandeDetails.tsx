import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Subject as SubjectIcon,
  Person as PersonIcon,
  Paid as PaidIcon,
  ShoppingCart as ShoppingCartIcon,
  RequestQuote as RequestQuoteIcon,
  Percent as PercentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as DeliveryIcon,
  Home as HomeIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import './CommandeDetails.css';

// ==================== Types & Interfaces ====================
interface CommandeDetails {
  id?: number;
  codeSuivi: string;
  statut: string;
  quantite: number;
  montantTotale: number;
  dateCreation: string;
  description: string;
  prixUnitaire: number;
  montantHorsTax: number;
  tva: number;
  utilisateurIdentifiant: string;
}

interface LivreurDetails {
  nom: string;
  email: string;
  telephone: string;
}

// ==================== Utility Functions ====================
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};



const getTimelineSteps = (statut: string) => {
  const steps = [
    { label: 'Commande confirmée', status: 'completed' },
    { label: 'En préparation', status: statut === 'en préparation' || statut === 'en transit' || statut === 'livré' ? 'completed' : 'pending' },
    { label: 'En transit', status: statut === 'en transit' || statut === 'livré' ? 'completed' : 'pending' },
    { label: 'Livré', status: statut === 'livré' ? 'completed' : 'pending' }
  ];
  return steps;
};

const getProgressPercentage = (statut: string) => {
  switch (statut.toLowerCase()) {
    case 'en préparation': return 25;
    case 'en transit': return 75;
    case 'livré': return 100;
    default: return 0;
  }
};

// ==================== Main Component ====================
export const CommandeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { commandeDetails } = location.state as { commandeDetails: CommandeDetails };
  const [livreurDetails, setLivreurDetails] = useState<LivreurDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour vérifier si le bouton de localisation doit être activé
  const isLocateButtonEnabled = () => {
    const statut = commandeDetails.statut.toLowerCase();
    return statut === "en préparation" || statut === "en transit";
  };

  const handleLocateClick = () => {
    if (isLocateButtonEnabled()) {
      navigate(`/commande/${commandeDetails.codeSuivi}/location`);
    }
  };

  useEffect(() => {
    console.log("CommandeDetails mounted with:", commandeDetails);

    // Si nous avons un code de suivi mais pas d'ID, récupérer les détails
    if (!commandeDetails.id && commandeDetails.codeSuivi) {
      const fetchCommandeDetails = async () => {
        try {
          const response = await fetch(
            `http://localhost:5283/api/commandes/details/code/${commandeDetails.codeSuivi}`
          );
          if (!response.ok) throw new Error("Impossible de récupérer les détails de la commande");
          const data = await response.json();

          // Mettre à jour l'état avec les détails complets
          // Cela va déclencher un re-render avec l'ID disponible
          navigate(`/commande/${commandeDetails.codeSuivi}`, {
            state: { commandeDetails: data },
            replace: true // Remplacer l'entrée actuelle dans l'historique
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Erreur lors de la récupération des détails");
        }
      };

      fetchCommandeDetails();
    }
  }, []);

  useEffect(() => {
    const fetchLivreurDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5283/api/utilisateurs/details-livreur/${commandeDetails.utilisateurIdentifiant}`
        );
        if (!response.ok) throw new Error("Impossible de récupérer les informations du livreur");
        const data = await response.json();
        setLivreurDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de la récupération des détails");
      }
    };
    fetchLivreurDetails();
  }, [commandeDetails.utilisateurIdentifiant]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <button
          className="back-link"
          onClick={() => navigate("/")}
        >
          <ArrowBackIcon />
          <span className="back-link-text">Retour</span>
        </button>

        <Tooltip
          title={!isLocateButtonEnabled() ? "Statut livré" : ""}
          arrow
          placement="top"
        >
          <span>
            <button
              className={`locate-button ${!isLocateButtonEnabled() ? 'disabled' : ''}`}
              onClick={handleLocateClick}
              disabled={!isLocateButtonEnabled()}
            >
              <LocationOnIcon />
              <span>Localisez</span>
            </button>
          </span>
        </Tooltip>
      </Box>

      {/* Section d'alerte et informations rapides - Style amélioré */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="commande-details-section" sx={{
            p: 4,
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box component="span" sx={{ fontSize: '1.5rem', mr: 1 }}>📋</Box>
              <Box>
                <Typography variant="h6" sx={{
                  fontWeight: 600,
                  color: 'var(--primary-color)',
                  mb: 1,
                  pb: 0.5,
                  borderBottom: '2px solid var(--primary-color)',
                  display: 'inline-block'
                }}>
                  Commande Confirmée
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Votre colis est pris en charge
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="delivery-section" sx={{
            p: 4
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box component="span" sx={{ fontSize: '1.5rem', mr: 1 }}>🚚</Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: 'var(--accent-color)',
                    mb: 1,
                    pb: 0.5,
                    borderBottom: '2px solid var(--accent-color)',
                    display: 'inline-block'
                  }}>
                    Estimation de livraison
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Basée sur votre localisation
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h5" sx={{
                fontWeight: 600,
                color: 'var(--accent-color)'
              }}>
                12-48h
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Barre de progression - Style amélioré */}
      <Paper elevation={0} className="progress-section" sx={{
        p: 4,
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box component="span" sx={{ fontSize: '1.5rem', mr: 1 }}>📊</Box>
          <Typography variant="h6" sx={{
            fontWeight: 600,
            color: 'var(--secondary-color)',
            pb: 0.5,
            borderBottom: '2px solid var(--secondary-color)',
            display: 'inline-block'
          }}>
            Suivi de la commande
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={getProgressPercentage(commandeDetails.statut)}
          sx={{
            height: 10,
            borderRadius: 6,
            bgcolor: 'rgba(4, 190, 254, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          {getTimelineSteps(commandeDetails.statut).map((step, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{
                color: step.status === 'completed' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: step.status === 'completed' ? 600 : 400,
                fontSize: '0.75rem'
              }}
            >
              {step.label}
            </Typography>
          ))}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Colonne gauche */}
        <Grid item xs={12} md={8}>


      {/* Détails de la commande - Style amélioré */}
      <Paper elevation={0} className="commande-details-section" sx={{
        p: 4,
        mb: 4
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          color: 'var(--primary-color)',
          mb: 3,
          pb: 1,
          borderBottom: '2px solid var(--primary-color)',
          display: 'inline-block'
        }}>
          <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>📋</Box>
          Détails de la Commande
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Description avec style spécial */}
          <Box className="detail-item" sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            '&:hover': {
              bgcolor: 'rgba(39, 63, 79, 0.05)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SubjectIcon sx={{ color: '#273F4F' }} />
              <Typography variant="body1" color="#273F4F">
                Description
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                pl: 4  // Padding left pour aligner avec le texte après l'icône
              }}
            >
              {commandeDetails.description}
            </Typography>
          </Box>

          {/* Autres détails */}
          <Box className="detail-item">
            <InfoRow
              label="Quantité"
              value={commandeDetails.quantite.toString()}
              icon={<ShoppingCartIcon sx={{ color: '#273F4F' }} />}
            />
          </Box>
        </Box>
      </Paper>

      {/* Détails financiers */}
      <Paper className="financial-section" sx={{
        p: 3,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <PaidIcon sx={{
            color: 'var(--secondary-color)',
            fontSize: 28
          }} />
          <Typography variant="h6" sx={{ color: 'var(--secondary-color)' }}>
            Détails Financiers
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box className="detail-item">
            <InfoRow
              label="Prix unitaire"
              value={`${commandeDetails.prixUnitaire.toFixed(3)} DT`}
              isCurrency
              icon={<RequestQuoteIcon sx={{ color: '#273F4F' }} />}
            />
          </Box>
          <Box className="detail-item">
            <InfoRow
              label="TVA"
              value={`${commandeDetails.tva}%`}
              icon={<PercentIcon sx={{ color: '#273F4F' }} />}
            />
          </Box>

          {/* Montant total */}
          <Box className="inner-content" sx={{
            mt: 2,
            p: 2,
            background: 'linear-gradient(135deg, var(--secondary-light) 0%, rgba(67, 24, 255, 0.1) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(4, 190, 254, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'var(--secondary-color)', fontWeight: 600 }}>
              Montant total
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--primary-color)',
                fontWeight: 600,
                fontFamily: 'Roboto Mono, monospace',
                direction: 'ltr'
              }}
            >
              {`${commandeDetails.montantTotale.toFixed(3)} DT`}
            </Typography>
          </Box>
        </Box>
      </Paper>

          {/* Informations Livreur */}
          <Paper className="delivery-section" sx={{
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PersonIcon sx={{ color: 'var(--accent-color)' }} />
              <Typography variant="h6" sx={{ color: 'var(--accent-color)' }}>
                Informations Livreur
              </Typography>
            </Box>

            {error ? (
              <Alert severity="error" sx={{ borderRadius: '8px' }}>
                {error}
              </Alert>
            ) : !livreurDetails ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} sx={{ color: 'var(--primary-color)' }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box className="detail-item">
                  <InfoRow
                    label="Nom"
                    value={livreurDetails.nom}
                    icon={<PersonIcon sx={{ color: '#273F4F'  }} />}
                  />
                </Box>
                <Box className="detail-item">
                  <InfoRow
                    label="Email"
                    value={livreurDetails.email}
                    icon={<EmailIcon sx={{ color: '#273F4F' }} />}
                  />
                </Box>
                <Box className="detail-item">
                  <InfoRow
                    label="Téléphone"
                    value={livreurDetails.telephone}
                    icon={<PhoneIcon sx={{ color: '#273F4F' }} />}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Colonne droite */}
        <Grid item xs={12} md={4}>
          {/* Statistiques rapides */}
          <Paper className="commande-details-section" sx={{
            p: 3,
            mb: 3
          }}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              color: 'var(--primary-color)',
              mb: 3,
              pb: 1,
              borderBottom: '2px solid var(--primary-color)',
              display: 'inline-block'
            }}>
              <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>📊</Box>
              Résumé de la Commande
            </Typography>

            <TableContainer>
              <Table size="small" sx={{ border: 'none' }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{
                      fontWeight: 600,
                      width: '40%',
                      color: '#000000',
                      borderBottom: '1px solid #e0e0e0',
                      py: 1.5
                    }}>
                      Statut
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #e0e0e0', py: 1.5 }}>
                      <Box component="span" className="status-chip-blue">
                        {commandeDetails.statut}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 1.5 }}>
                      Date de Création
                    </TableCell>
                    <TableCell sx={{ py: 1.5, color: '#888' }}>
                      {formatDate(commandeDetails.dateCreation)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#000000', py: 1.5 }}>
                      Montant Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'var(--secondary-color)', py: 1.5 }}>
                      {commandeDetails.montantTotale.toFixed(3)} DT
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>



          {/* Section Performance */}
          <Paper className="delivery-section" sx={{
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SpeedIcon sx={{ color: 'var(--accent-color)' }} />
              <Typography variant="h6" sx={{ color: 'var(--accent-color)' }}>
                Performance
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Temps de traitement
                </Typography>
                <Chip
                  label="Rapide"
                  size="small"
                  sx={{
                    bgcolor: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    fontWeight: 600
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Satisfaction client
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: 'var(--green-color)', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: 'var(--green-color)', fontWeight: 600 }}>
                    Excellente
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Efficacité
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: 'var(--sky-color)', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: 'var(--sky-color)', fontWeight: 600 }}>
                    98%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Section Sécurité */}
          <Paper className="financial-section" sx={{
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SecurityIcon sx={{ color: 'var(--secondary-color)' }} />
              <Typography variant="h6" sx={{ color: 'var(--secondary-color)' }}>
                Sécurité
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: 'var(--secondary-color)', fontSize: 16 }} />
                <Typography variant="body2">
                  Colis sécurisé
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: 'var(--secondary-color)', fontSize: 16 }} />
                <Typography variant="body2">
                  Suivi en temps réel
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: 'var(--secondary-color)', fontSize: 16 }} />
                <Typography variant="body2">
                  Assurance incluse
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Section Contact Livreur */}
          <Paper className="delivery-section" sx={{
            p: 3,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <PhoneIcon sx={{ color: 'var(--accent-color)' }} />
              <Typography variant="h6" sx={{ color: 'var(--accent-color)' }}>
                Contact Livreur
              </Typography>
            </Box>

            {livreurDetails ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PhoneIcon sx={{ color: 'var(--accent-color)', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {livreurDetails.telephone}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ color: 'var(--accent-color)', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {livreurDetails.email}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Contactez directement votre livreur {livreurDetails.nom}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={20} sx={{ color: 'var(--purple-color)' }} />
              </Box>
            )}
          </Paper>

          {/* Actions rapides */}
          <Paper sx={{
            p: 4,
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)',
            border: '1px solid #e9d5ff'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                p: 1.5,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <DeliveryIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" sx={{ color: '#581c87', fontWeight: 700 }}>
                Actions
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<LocationOnIcon />}
                onClick={handleLocateClick}
                disabled={!isLocateButtonEnabled()}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(4, 190, 254, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(67, 24, 255, 0.4)',
                  },
                  '&:disabled': {
                    background: '#9CA3AF !important',
                    color: '#6B7280 !important',
                    transform: 'none',
                    boxShadow: 'none !important',
                    opacity: 0.7
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Localiser le colis
              </Button>



              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                fullWidth
                sx={{
                  textTransform: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(67, 24, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(4, 190, 254, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Retour à l'accueil
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const InfoRow = ({
  label,
  value,
  isCurrency = false,
  icon
}: {
  label: string;
  value: string;
  isCurrency?: boolean;
  icon?: React.ReactNode;
}) => (
  <Box sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 1,
    gap: 2,
    '&:hover': {
      bgcolor: 'rgba(0,0,0,0.02)',
      borderRadius: '8px'
    }
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: '120px' }}>
      {icon && (
        <Box>
          {icon}
        </Box>
      )}
      <Typography variant="body1" color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body1"
      sx={{
        fontWeight: 500,
        fontFamily: isCurrency ? 'Roboto Mono, monospace' : 'inherit',
        direction: 'ltr',
        flex: 1,
        textAlign: 'right'
      }}
    >
      {value}
    </Typography>
  </Box>
);
































