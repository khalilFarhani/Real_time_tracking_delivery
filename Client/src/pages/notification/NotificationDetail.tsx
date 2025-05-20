import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, Chip, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmailIcon from '@mui/icons-material/Email';
import './NotificationDetail.css';
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  subject: string;
  body: string;
  sentDate: string;
  isRead: boolean;
  codeSuivi: string | null;
}

export const NotificationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notification } = location.state as { notification: Notification };
  const [commandeDetails, setCommandeDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedNotifications, setRelatedNotifications] = useState<Notification[]>([]);

  // Add this at the beginning of the component to debug
  useEffect(() => {
    console.log("Notification detail mounted");
    console.log("Location state:", location.state);
    console.log("Notification:", notification);
  }, []);

  // Récupérer les détails de la commande associée si un code de suivi est présent
  useEffect(() => {
    const fetchCommandeDetails = async () => {
      if (!notification.codeSuivi && !notification.commandeId) {
        console.log("No codeSuivi or commandeId in notification");
        return;
      }
      
      setLoading(true);
      try {
        // Si nous avons un ID de commande, utilisons-le directement
        if (notification.commandeId) {
          console.log("Using commandeId directly:", notification.commandeId);
          const response = await fetch(`http://localhost:5283/api/commandes/details/${notification.commandeId}`);
          
          if (!response.ok) {
            throw new Error('Impossible de récupérer les détails de la commande');
          }
          
          const data = await response.json();
          console.log("Commande details received:", data);
          setCommandeDetails(data);
          return;
        }
        
        // Sinon, utilisons le code de suivi
        console.log("Fetching commande details for codeSuivi:", notification.codeSuivi);
        const response = await fetch(`http://localhost:5283/api/commandes/details/code/${notification.codeSuivi}`);
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails de la commande');
        }
        
        const data = await response.json();
        console.log("Commande details received:", data);
        setCommandeDetails(data);
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des détails');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommandeDetails();
  }, [notification.codeSuivi, notification.commandeId]);

  // Update the fetchNotificationsForCommande function to match the backend response fields
  const fetchNotificationsForCommande = async (commandeId: number) => {
    if (!commandeId) return;
    
    setLoading(true);
    try {
      console.log(`Fetching notifications for commande ID: ${commandeId}`);
      const response = await fetch(`http://localhost:5283/api/notification/by-commande/${commandeId}`);
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les notifications de la commande');
      }
      
      const data = await response.json();
      console.log("Données brutes reçues:", data);
      
      // Map the backend field names to the frontend field names
      const formattedNotifications = data.map((item: any) => ({
        id: item.id,
        subject: item.subject,
        body: item.body,
        sentDate: item.sentDate,
        isRead: item.isRead,
        codeSuivi: item.codeSuivi,
        commandeId: item.commandeId
      }));
      
      console.log("Notifications formatées:", formattedNotifications);
      setRelatedNotifications(formattedNotifications);
      return formattedNotifications;
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des notifications');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Modifiez useEffect pour récupérer les notifications liées si un commandeDetails est disponible
  useEffect(() => {
    console.log("CommandeDetails changed:", commandeDetails);
    
    if (commandeDetails?.id) {
      console.log("Fetching notifications for commande ID:", commandeDetails.id);
      fetchNotificationsForCommande(commandeDetails.id);
    } else {
      console.log("No commandeDetails.id available");
    }
  }, [commandeDetails]);

  // Fonction pour déterminer le type de notification
  const getNotificationType = (subject: string): 'confirmation' | 'status' | 'other' => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('confirmation')) return 'confirmation';
    if (lowerSubject.includes('mise à jour')) return 'status';
    return 'other';
  };

  // Fonction pour obtenir l'icône appropriée pour la notification
  const getNotificationIcon = (subject: string) => {
    const type = getNotificationType(subject);
    
    if (type === 'confirmation') {
      return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />;
    } else if (type === 'status') {
      return <LocalShippingIcon sx={{ color: 'primary.main', fontSize: 40 }} />;
    }
    return <EmailIcon sx={{ color: 'info.main', fontSize: 40 }} />;
  };

  // Fonction pour formater le HTML du corps du message
  const formatHtmlBody = (body: string) => {
    return { __html: body };
  };

  // Fonction pour naviguer vers les détails de la commande
  const handleViewOrder = () => {
    if (notification.codeSuivi) {
      navigate(`/commande/${notification.codeSuivi}`, { 
        state: { commandeDetails: commandeDetails } 
      });
    }
  };

  // Add this function to mark all notifications as read for a specific order
  const handleMarkAllAsRead = async (commandeId: number) => {
    if (!commandeId) return;
    
    try {
      const response = await fetch(`http://localhost:5283/api/notification/mark-all-read/by-commande/${commandeId}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Impossible de marquer toutes les notifications comme lues');
      }
      
      // Update local state to mark all notifications as read
      setRelatedNotifications(relatedNotifications.map(n => ({...n, isRead: true})));
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des notifications');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="back-link"
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon />
          <span className="back-link-text">Retour</span>
        </button>
      
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ mr: 2 }}>
            {getNotificationIcon(notification.subject)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {notification.subject.includes('#') 
                ? notification.subject.replace(/#[a-zA-Z0-9-]+/, '') 
                : notification.subject}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Reçu le {new Date(notification.sentDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={500}>
            Message:
          </Typography>
          <Box 
            className="notification-body"
            dangerouslySetInnerHTML={formatHtmlBody(notification.body)} 
          />
        </Box>
      </Paper>
    </Container>
  );
};























