import { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, useTheme, SxProps } from '@mui/material';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Correction pour les icônes Leaflet (compatible TypeScript)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Définir les icônes par défaut sans utiliser _getIconUrl
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  commandeCount: number;
}

interface LocationMapProps {
  sx?: SxProps;
}

const LocationMap = ({ sx }: LocationMapProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const theme = useTheme();
  const API_URL = 'http://localhost:5283';

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/commandes/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des emplacements:', error);
      // Données de démonstration en cas d'erreur
      setLocations([
        {
          id: 1,
          name: 'Client A',
          address: 'Tunis, Tunisie',
          latitude: 36.8065,
          longitude: 10.1815,
          commandeCount: 5,
        },
        {
          id: 2,
          name: 'Client B',
          address: 'Sfax, Tunisie',
          latitude: 34.7406,
          longitude: 10.7603,
          commandeCount: 3,
        },
        {
          id: 3,
          name: 'Client C',
          address: 'Sousse, Tunisie',
          latitude: 35.8245,
          longitude: 10.6346,
          commandeCount: 7,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Créer des icônes personnalisées en fonction du nombre de commandes
  const createCustomIcon = (commandeCount: number) => {
    let color = '';
    if (commandeCount <= 2) {
      color = theme.palette.success.main; // Vert
    } else if (commandeCount <= 5) {
      color = theme.palette.warning.main; // Jaune
    } else {
      color = theme.palette.error.main; // Rouge
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  // Calculer le centre de la carte
  const mapCenter: [number, number] = [34.0, 9.0]; // Centre par défaut sur la Tunisie

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: 350 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <CircularProgress size={30} color="primary" />
          <Typography ml={2}>Chargement de la carte...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Box component={Paper} sx={{ p: 3, ...sx }}>
      <Box sx={{ height: '100%', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={7}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          attributionControl={false}
        >
          <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={createCustomIcon(location.commandeCount)}
            >
              <Popup>
                <div>
                  <strong>{location.name}</strong>
                  <br />
                  {location.address}
                  <br />
                  <span style={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                    {location.commandeCount} commande{location.commandeCount > 1 ? 's' : ''}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default LocationMap;
