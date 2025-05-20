import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Container,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Correction pour les icônes Leaflet (compatible TypeScript)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Définir les icônes par défaut
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icône personnalisée pour la commande
const CommandeIcon = L.divIcon({
  className: 'commande-marker-icon',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      position: relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
        <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 4.77 7.96 15.14 8.3 15.54.29.35.79.35 1.08 0 .34-.4 8.3-10.77 8.3-15.54C21.21 3.81 17.39 0 12.7 0zm.7 11.93c-1.9 0-3.44-1.54-3.44-3.44S10.8 5.05 12.7 5.05s3.44 1.54 3.44 3.44-1.54 3.44-3.44 3.44z"
        fill="#e53935" stroke="#ffffff" stroke-width="1" />
        <circle cx="12.7" cy="8.5" r="2.5" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CommandeMapProps {
  commandeId: number;
  onBack: () => void;
}

interface CommandeLocation {
  latitude: number;
  longitude: number;
  statut: string;
  adressClient?: string;
  nomClient?: string;
}

// Fonction pour obtenir la couleur en fonction du statut
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'en attente':
      return '#ff9800'; // Orange
    case 'en cours':
      return '#2196f3'; // Bleu
    case 'livrée':
      return '#4caf50'; // Vert
    case 'annulée':
      return '#f44336'; // Rouge
    default:
      return '#757575'; // Gris par défaut
  }
};

const CommandeMap: React.FC<CommandeMapProps> = ({ commandeId, onBack }) => {
  const [location, setLocation] = useState<CommandeLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    const fetchCommandeLocation = async () => {
      try {
        setLoading(true);
        // Récupérer les coordonnées de la commande
        const response = await axios.get(`${API_URL}/api/commandes/position/${commandeId}`);

        // Récupérer les détails de la commande pour avoir l'adresse et le nom du client
        const detailsResponse = await axios.get(`${API_URL}/api/commandes/details/${commandeId}`);

        setLocation({
          ...response.data,
          adressClient: detailsResponse.data.adressClient,
          nomClient: detailsResponse.data.nomClient,
        });
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération de la localisation:', error);
        setError('Impossible de récupérer la localisation de la commande.');
        setLoading(false);
      }
    };

    fetchCommandeLocation();
  }, [commandeId]);

  // Si les coordonnées sont à 0, utiliser le centre de la Tunisie
  const defaultCenter: [number, number] = [34.0, 9.0]; // Centre de la Tunisie

  // Vérifier si les coordonnées sont valides (différentes de 0)
  const hasValidCoordinates = location && (location.latitude !== 0 || location.longitude !== 0);

  // Centre de la carte
  const mapCenter: [number, number] = hasValidCoordinates
    ? [location!.latitude, location!.longitude]
    : defaultCenter;

  // Niveau de zoom moins précis pour voir une zone plus large
  const zoomLevel = hasValidCoordinates ? 10 : 7;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Localisation de la commande #{commandeId}</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
              Retour
            </Button>
          </Box>
        ) : (
          <Box sx={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={mapCenter}
              zoom={zoomLevel}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              attributionControl={false}
            >
              <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {hasValidCoordinates && (
                <Marker position={[location!.latitude, location!.longitude]} icon={CommandeIcon}>
                  <Popup>
                    <div style={{ padding: '10px', maxWidth: '280px' }}>
                      <div
                        style={{
                          borderBottom: '2px solid #f44336',
                          paddingBottom: '10px',
                          marginBottom: '12px',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          color: '#f44336',
                          textAlign: 'center',
                        }}
                      >
                        Commande #{commandeId}
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            marginBottom: '6px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ marginRight: '6px' }}>📋</span> Client
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#555',
                            lineHeight: '1.5',
                            backgroundColor: '#f9f9f9',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                          }}
                        >
                          {location?.nomClient || 'Non spécifié'}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            marginBottom: '6px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ marginRight: '6px' }}>📍</span> Adresse
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#555',
                            lineHeight: '1.5',
                            backgroundColor: '#f9f9f9',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                          }}
                        >
                          {location?.adressClient || 'Non spécifiée'}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            marginBottom: '6px',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ marginRight: '6px' }}>🔍</span> Coordonnées
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#555',
                            lineHeight: '1.5',
                            backgroundColor: '#f9f9f9',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid #eee',
                            fontFamily: 'monospace',
                          }}
                        >
                          Lat: {location?.latitude.toFixed(6)}, Long:{' '}
                          {location?.longitude.toFixed(6)}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px 12px',
                          backgroundColor: getStatusColor(location?.statut || ''),
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginTop: '10px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {location?.statut || 'Statut inconnu'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {!hasValidCoordinates && (
              <Box sx={{ mt: 3, textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                <Typography variant="subtitle1" color="warning.main" fontWeight="medium">
                  Cette commande n'a pas encore de coordonnées GPS assignées.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Les coordonnées seront disponibles lorsque la commande sera en transit.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CommandeMap;
