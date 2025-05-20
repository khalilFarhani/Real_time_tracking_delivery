import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
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
import googleMapKey from '../../googleMapKey';
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

const defaultCenter = {
  lat: 36.8065, // Centre de la Tunisie
  lng: 10.1815
};

export const CommandeLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapKey,
    libraries: ['places']
  });

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
      if (map) {
        const position = { lat: data.latitude, lng: data.longitude };
        console.log("Centering map on position:", position);
        map.setCenter(position);
        map.setZoom(15); // Assurer un niveau de zoom approprié
      }
    } catch (err) {
      console.error("Error fetching location:", err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération de la position');
    } finally {
      setLoading(false);
    }
  }, [id, map]);

  useEffect(() => {
    fetchLocation();
    const intervalId = setInterval(fetchLocation, 10000);
    return () => clearInterval(intervalId);
  }, [fetchLocation]);

  const onMapLoad = (mapInstance: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMap(mapInstance);
    
    if (location?.latitude && location?.longitude) {
      const position = { 
        lat: location.latitude, 
        lng: location.longitude 
      };
      
      console.log("Centering map on position:", position);
      mapInstance.setCenter(position);
      mapInstance.setZoom(15);
    }
  };

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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

  if (loadError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Erreur de chargement de Google Maps: {loadError.message}
        </Alert>
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
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: location.latitude, lng: location.longitude }}
              zoom={15}
              onLoad={onMapLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: true
              }}
            >
              <Marker
                position={{
                  lat: location.latitude,
                  lng: location.longitude
                }}
              />
            </GoogleMap>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2 }}>Chargement de la carte...</Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Alert severity="info">
          Aucune donnée de localisation disponible pour cette commande
        </Alert>
      )}
    </Container>
  );
};









