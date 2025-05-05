import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IconButton, InputBase, Badge, Menu, MenuItem, Typography, Box, Divider, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import logo from '../../assets/images/logo.png';
import './Header.css';

interface Notification {
  id: number;
  subject: string;
  body: string;
  sentDate: string;
  isRead: boolean;
  codeSuivi: string | null;
  commandeId: number;
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Get the current notification ID if we're on a notification detail page
  const getCurrentNotificationId = (): number | null => {
    const match = location.pathname.match(/\/notification\/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  };
  
  const currentNotificationId = getCurrentNotificationId();
  
  // Extract commandeId from location state or URL
  const getCommandeId = () => {
    // If we're on a notification page, try to get commandeId from the notification state
    if (currentNotificationId) {
      const state = location.state as any;
      if (state?.notification?.commandeId) {
        return state.notification.commandeId;
      }
    }
    
    // Try to get from location state
    const state = location.state as any;
    if (state?.commandeDetails?.id) {
      return state.commandeDetails.id;
    }
    
    // Try to extract from URL if we're on a commande page
    const match = location.pathname.match(/\/commande\/([^\/]+)/);
    if (match && match[1]) {
      return match[1]; // This is the codeSuivi, not the ID
    }
    
    return null;
  };
  
  const commandeId = getCommandeId();
  
  // Fetch notifications for current commande
  useEffect(() => {
    if (commandeId) {
      fetchNotificationsForCommande(commandeId);
    } else {
      // If no commandeId, just set empty notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [commandeId, location.pathname]);
  
  const fetchNotificationsForCommande = async (commandeId: number | string) => {
    try {
      // If we have a codeSuivi instead of an ID, we need to get the commande details first
      let id = commandeId;
      if (typeof commandeId === 'string' && !Number.isInteger(Number(commandeId))) {
        const response = await fetch(`http://localhost:5283/api/commandes/details/code/${commandeId}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des détails de la commande');
        const data = await response.json();
        id = data.id;
      }
      
      console.log(`Fetching notifications for commande ID: ${id}`);
      const response = await fetch(`http://localhost:5283/api/notification/by-commande/${id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      
      const data = await response.json();
      console.log("Notifications reçues:", data);
      
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
      
      // Filter out the current notification if we're on a notification detail page
      const filteredNotifications = currentNotificationId 
        ? formattedNotifications.filter(n => n.id !== currentNotificationId)
        : formattedNotifications;
      
      setNotifications(filteredNotifications);
      
      // Count unread notifications
      const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };
  
  const fetchUnreadCountForCommande = async (commandeId: number) => {
    try {
      const response = await fetch(`http://localhost:5283/api/notification/unread-count/by-commande/${commandeId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nombre de notifications');
      }
      
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = async (notification: Notification) => {
    // Ne marquer comme lu que si la notification n'est pas déjà lue
    if (!notification.isRead) {
      try {
        await fetch(`http://localhost:5283/api/notification/mark-read/${notification.id}`, {
          method: 'PUT'
        });
        
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? {...n, isRead: true} : n
        ));
        setUnreadCount(prev => prev - 1);
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
    
    // Navigate to notification detail page
    handleClose();
    navigate(`/notification/${notification.id}`, { 
      state: { notification: notification } 
    });
  };

  const handleMarkAllRead = async () => {
    if (!commandeId) return;
    
    try {
      // Use the endpoint to mark all notifications as read for this commande
      await fetch(`http://localhost:5283/api/notification/mark-all-read/by-commande/${commandeId}`, {
        method: 'PUT'
      });
      
      // Update local state
      setNotifications(notifications.map(n => ({...n, isRead: true})));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Fonction pour déterminer le type de notification
  const getNotificationType = (subject: string): 'confirmation' | 'status' | 'other' => {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('confirmation')) return 'confirmation';
    if (lowerSubject.includes('mise à jour')) return 'status';
    return 'other';
  };

  // Fonction pour extraire le code de suivi du sujet
  const extractCodeSuivi = (subject: string): string | null => {
    const match = subject.match(/#([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  // Fonction pour extraire le statut du corps du message
  const extractStatus = (body: string): string | null => {
    const statusMatch = body.match(/Nouveau statut\s*:\s*([^<\n]+)/i);
    if (statusMatch && statusMatch[1]) {
      return statusMatch[1].trim();
    }
    return null;
  };

  // Fonction pour formater le contenu de la notification
  const formatNotificationContent = (notification: Notification): string => {
    const type = getNotificationType(notification.subject);
    
    if (type === 'confirmation') {
      return "Commande confirmée";
    } 
    else if (type === 'status') {
      const status = extractStatus(notification.body);
      return status ? `Statut: ${status}` : "Statut mis à jour";
    }
    
    return notification.body.length > 60 
      ? notification.body.substring(0, 60) + '...' 
      : notification.body;
  };

  // Fonction pour obtenir l'icône appropriée pour la notification
  const getNotificationIcon = (subject: string) => {
    const type = getNotificationType(subject);
    
    if (type === 'confirmation') {
      return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main', mr: 1 }} />;
    } else if (type === 'status') {
      return <LocalShippingIcon fontSize="small" sx={{ color: 'primary.main', mr: 1 }} />;
    }
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Veuillez entrer un code de suivi');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5283/api/commandes/details/code/${searchQuery}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Commande non trouvée');
        }
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      navigate(`/commande/${searchQuery}`, { state: { commandeDetails: data } });
      setError(null);
      setSearchQuery('');
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Code de suivi invalide ou commande non trouvée');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <span className="brand-name">Axia Livraison</span>
        </Link>

        <form onSubmit={handleSearch} className="search-container">
          <SearchIcon className="search-icon" />
          <InputBase
            placeholder="Rechercher par code de suivi"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError(null);
            }}
            className="search-input"
          />
          {error && <div className="search-error">{error}</div>}
        </form>

        <div className="action-buttons">
          <IconButton 
            className="action-button"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton 
            className="action-button"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: '350px',
              },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Notifications</Typography>
              {unreadCount > 0 && (
                <Typography 
                  variant="body2" 
                  sx={{ color: 'primary.main', cursor: 'pointer' }}
                  onClick={handleMarkAllRead}
                >
                  Tout marquer comme lu
                </Typography>
              )}
            </Box>
            <Divider />
            
            {notifications.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2">
                  {currentNotificationId 
                    ? "Aucune autre notification pour cette commande" 
                    : "Aucune notification"}
                </Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={() => handleNotificationItemClick(notification)}
                  sx={{ 
                    backgroundColor: notification.isRead ? 'inherit' : 'rgba(255, 107, 43, 0.05)',
                    borderLeft: notification.isRead ? 'none' : '3px solid var(--primary-color)',
                    py: 1.5
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      {getNotificationIcon(notification.subject)}
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                        {getNotificationType(notification.subject) === 'confirmation' 
                          ? 'Confirmation de commande' 
                          : getNotificationType(notification.subject) === 'status'
                            ? 'Mise à jour de statut'
                            : notification.subject}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatNotificationContent(notification)}
                    </Typography>
                    
                    
                    
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                      {new Date(notification.sentDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>
        </div>
      </div>
    </header>
  );
}








