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
  Divider,
} from "@mui/material";
import { 
  ArrowBack as ArrowBackIcon,
  LocalShipping as LocalShippingIcon,
  Subject as SubjectIcon,
  Description as DescriptionIcon,  // Pour l'en-tête "Détails de la commande"
  Person as PersonIcon,
  Paid as PaidIcon,
  MonetizationOn as MonetizationOnIcon,
  ShoppingCart as ShoppingCartIcon,
  RequestQuote as RequestQuoteIcon,
  Percent as PercentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import './CommandeDetails.css';

// ==================== Types & Interfaces ====================
interface CommandeDetails {
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

const getStatusStyle = (statut: string) => {
  // Utilise les mêmes couleurs pour tous les statuts
  return {
    bgcolor: '#FFF3CD',
    color: '#856404'
  };
};

// ==================== Main Component ====================
export const CommandeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { commandeDetails } = location.state as { commandeDetails: CommandeDetails };
  const [livreurDetails, setLivreurDetails] = useState<LivreurDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocateClick = () => {
    navigate(`/commande/${commandeDetails.codeSuivi}/location`);
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
    <Container maxWidth="md" sx={{ py: 4 }}>
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

        <button 
          className="locate-button"
          onClick={handleLocateClick}
        >
          <LocationOnIcon />
          <span>Localisez colis</span>
        </button>
      </Box>

      {/* En-tête de la commande */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ 
            bgcolor: 'var(--primary-light)', 
            p: 2, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center'
          }}>
            <LocalShippingIcon sx={{ color: 'var(--primary-color)', fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>
              Commande
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip 
                label={commandeDetails.statut}
                sx={{
                  ...getStatusStyle(commandeDetails.statut),
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: '28px',
                  width: 'fit-content'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {formatDate(commandeDetails.dateCreation)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Détails de la commande */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <DescriptionIcon sx={{ color: 'var(--primary-color)' }} />
          <Typography variant="h6" sx={{ color: 'var(--primary-color)' }}>
            Détails de la Commande
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Description avec style spécial */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 1,
            '&:hover': {
              bgcolor: 'rgba(39, 63, 79, 0.05)',
              borderRadius: '8px'
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
          <InfoRow 
            label="Quantité" 
            value={commandeDetails.quantite.toString()}
            icon={<ShoppingCartIcon sx={{ color: '#273F4F' }} />}
          />
        </Box>
      </Paper>

      {/* Détails financiers */}
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <PaidIcon sx={{ 
            color: 'var(--primary-color)',
            fontSize: 28
          }} />
          <Typography variant="h6" sx={{ color: 'var(--primary-color)' }}>
            Détails Financiers
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <InfoRow 
            label="Prix unitaire" 
            value={`${commandeDetails.prixUnitaire.toFixed(3)} DT`}
            isCurrency
            icon={<RequestQuoteIcon sx={{ color: '#273F4F' }} />}
          />
          <InfoRow 
            label="TVA" 
            value={`${commandeDetails.tva}%`}
            icon={<PercentIcon sx={{ color: '#273F4F' }} />}
          />
          
          {/* Montant total */}
          <Box sx={{ 
            mt: 2,
            p: 2, 
            bgcolor: '#FFF3CD', // Même couleur que le statut
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" sx={{ color: '#856404', fontWeight: 600 }}> {/* Même couleur que le texte du statut */}
              Montant total
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#856404', // Même couleur que le texte du statut
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
      <Paper sx={{ 
        p: 3,
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <PersonIcon sx={{ color: 'var(--primary-color)' }} />
          <Typography variant="h6" sx={{ color: 'var(--primary-color)' }}>
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
            <InfoRow 
              label="Nom" 
              value={livreurDetails.nom}
              icon={<PersonIcon sx={{ color: '#273F4F'  }} />}
            />
            <InfoRow 
              label="Email" 
              value={livreurDetails.email}
              icon={<EmailIcon sx={{ color: '#273F4F' }} />}
            />
            <InfoRow 
              label="Téléphone" 
              value={livreurDetails.telephone}
              icon={<PhoneIcon sx={{ color: '#273F4F' }} />}
            />
          </Box>
        )}
      </Paper>
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
































