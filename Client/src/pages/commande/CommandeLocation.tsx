import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map as LeafletMap, Icon } from 'leaflet';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import leafletConfig from '../../leafletConfig';
import 'leaflet/dist/leaflet.css';
import './CommandeLocation.css';

interface Location {
  latitude: number;
  longitude: number;
  statut: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// Custom car icon
const carIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png', // Icône de voiture rouge
  iconSize: [36, 36],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const CommandeLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<LeafletMap | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      console.log(`Fetching position for order ID: ${id}`);
      const response = await fetch(`http://localhost:5283/api/commandes/position/code/${id}`);

      if (!response.ok) {
        console.error(`Server responded with status: ${response.status}`);
        const errorText = await response.text();
        console.error(`Error details: ${errorText}`);
        throw new Error(`Impossible de récupérer la position (${response.status})`);
      }

      const data = await response.json();
      console.log("Position data received:", data);

      if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number' ||
          isNaN(data.latitude) || isNaN(data.longitude)) {
        console.error("Invalid coordinates received:", data);
        throw new Error("Coordonnées de position invalides");
      }

      if (data.latitude < -90 || data.latitude > 90 ||
          data.longitude < -180 || data.longitude > 180) {
        console.error("Coordinates out of range:", data);
        throw new Error("Coordonnées hors limites");
      }

      console.log(`Setting map center to: ${data.latitude}, ${data.longitude}`);
      setLocation(data);

      // Si la carte est déjà chargée, centrer sur la nouvelle position
      if (mapRef.current) {
        const position = { lat: data.latitude, lng: data.longitude };
        console.log("Centering map on position:", position);
        mapRef.current.setView(position, 8); // Centrer et zoomer (zoom plus élevé = plus proche)
      }
    } catch (err) {
      console.error("Error fetching location:", err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la position');
    } finally {
      setLoading(false);
    }
  }, [id, mapRef]);

  useEffect(() => {
    fetchLocation();
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId);
  }, [fetchLocation]);



  if (loading && !location) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" height="300px">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Chargement des données de localisation...</Typography>
        </Box>
      </Container>
    );
  }



  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" gutterBottom>
          Localisation de la commande
        </Typography>

        {location?.statut && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Statut: {location.statut}
          </Typography>
        )}
      </Box>

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : location ? (
        <Paper elevation={3} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }} className="map-container">
          <MapContainer
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={18}
            style={mapContainerStyle}
            ref={mapRef}
          >
            <TileLayer
              url={leafletConfig.tileLayerUrl}
              attribution={leafletConfig.attribution}
              maxZoom={leafletConfig.maxZoom}
            />
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={carIcon}
            >
              <Popup>
                Statut: {location.statut || 'En cours de livraison'}
              </Popup>
            </Marker>
          </MapContainer>
        </Paper>
      ) : (
        <Alert severity="info">
          Aucune donnée de localisation disponible pour cette commande
        </Alert>
      )}
    </Container>
  );
};









