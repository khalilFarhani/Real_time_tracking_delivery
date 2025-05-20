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

interface Commande {
  commandeId: number;
  codeSuivi: string;
  nomClient: string;
  adresseClient: string;
  latitude: number;
  longitude: number;
}

interface Livreur {
  livreurId: number;
  nom: string;
  imagePath?: string;
  commandes: Commande[];
  nombreCommandes: number;
  nombreCommandesLivrees: number;
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  sx?: SxProps;
}

const LocationMap = ({ sx }: LocationMapProps) => {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [livreurAddresses, setLivreurAddresses] = useState<{ [key: number]: string }>({});
  const theme = useTheme();
  const API_URL = 'http://localhost:5283';

  // Fonction pour obtenir l'adresse à partir des coordonnées
  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
    livreurId: number,
  ) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      );

      if (response.data && response.data.display_name) {
        // Mettre à jour l'adresse du livreur
        setLivreurAddresses((prev) => ({
          ...prev,
          [livreurId]: response.data.display_name,
        }));
        return response.data.display_name;
      }
      return 'Adresse inconnue';
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse:", error);
      return 'Adresse inconnue';
    }
  };

  const fetchLivreursEnTransit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/Statistiques/livreurs-en-transit`);
      setLivreurs(response.data);

      // Récupérer les adresses pour les livreurs avec des coordonnées valides
      const livreursWithValidCoords = response.data.filter(
        (livreur: Livreur) => livreur.latitude !== 0 && livreur.longitude !== 0,
      );

      // Récupérer les adresses en parallèle
      await Promise.all(
        livreursWithValidCoords.map((livreur: Livreur) =>
          getAddressFromCoordinates(livreur.latitude, livreur.longitude, livreur.livreurId),
        ),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs en transit:', error);
      setLivreurs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLivreursEnTransit();

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(() => {
      fetchLivreursEnTransit();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Créer des icônes personnalisées pour les livreurs avec leur image
  const createLivreurIcon = (livreur: Livreur) => {
    // URL de base pour les images
    const API_URL = 'http://localhost:5283';

    // Image par défaut si le livreur n'a pas d'image
    const defaultImageUrl = `${API_URL}/images/default-user.png`;

    // Construire l'URL de l'image du livreur
    // Le chemin de l'image est déjà au format /images/filename.jpg, donc pas besoin de manipuler le chemin
    const imageUrl = livreur.imagePath ? `${API_URL}${livreur.imagePath}` : defaultImageUrl;

    console.log('Image URL for livreur', livreur.nom, ':', imageUrl);

    return L.divIcon({
      className: 'livreur-div-icon',
      html: `<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; overflow: hidden; background-color: white; box-shadow: 0 0 3px rgba(0,0,0,0.3);">
              <img src="${imageUrl}" alt="${livreur.nom}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${defaultImageUrl}';" />
            </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        Livreurs en transit
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={5}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          attributionControl={false}
        >
          <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {livreurs
            .filter((livreur) => livreur.latitude !== 0 && livreur.longitude !== 0)
            .map((livreur) => (
              <Marker
                key={livreur.livreurId}
                position={[livreur.latitude, livreur.longitude]}
                icon={createLivreurIcon(livreur)}
              >
                <Popup>
                  <div style={{ padding: '5px', maxWidth: '250px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '10px',
                        borderBottom: `2px solid ${theme.palette.primary.light}`,
                        paddingBottom: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          marginRight: '10px',
                          border: `2px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <img
                          src={`http://localhost:5283${livreur.imagePath}`}
                          alt={livreur.nom}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.src = 'http://localhost:5283/images/default-user.png';
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                          }}
                        >
                          {livreur.nom}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Livreur
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                          color: theme.palette.text.primary,
                        }}
                      >
                        Adresse actuelle
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: theme.palette.text.secondary,
                          lineHeight: '1.4',
                        }}
                      >
                        {livreurAddresses[livreur.livreurId] || "Chargement de l'adresse..."}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: theme.palette.background.default,
                        borderRadius: '4px',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: theme.palette.primary.main,
                          }}
                        >
                          {livreur.nombreCommandes}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          En transit
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: theme.palette.success.main,
                          }}
                        >
                          {livreur.nombreCommandesLivrees}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Livrées
                        </div>
                      </div>
                    </div>
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
