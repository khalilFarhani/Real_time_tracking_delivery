import { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconifyIcon from 'components/base/IconifyIcon';
import MemberCard from './MemberCard';
import Pagination from '@mui/material/Pagination';
import UtilisateurForm from 'pages/utilisateur/UtilisateurForm';
import { Utilisateur } from 'pages/utilisateur/types';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { SxProps } from '@mui/material';

const API_URL = 'http://localhost:5283';

interface LivreurProps {
  sx?: SxProps;
}

const Livreur = ({ sx }: LivreurProps) => {
  const [livreurs, setLivreurs] = useState<Utilisateur[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState<Utilisateur | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/utilisateurs/livreurs`);
      setLivreurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddUser = () => {
    setCurrentUtilisateur(null);
    setOpenUserDialog(true);
  };

  const handleEditUser = (utilisateur: Utilisateur) => {
    setCurrentUtilisateur(utilisateur);
    setOpenUserDialog(true);
  };

  const handleDeleteUser = (id: number) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/utilisateurs/supprimer/${userToDelete}`);

      fetchLivreurs();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUser = async (userData: {
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
    motDePasse: string;
    imageFile?: File;
  }) => {
    try {
      const formData = new FormData();

      // Assurez-vous que les noms de champs correspondent exactement à ceux attendus par le DTO
      formData.append('Nom', userData.nom);
      formData.append('Email', userData.email);
      formData.append('Telephone', userData.telephone);
      formData.append('Identifiant', userData.identifiant);
      formData.append('MotDePasse', userData.motDePasse);

      if (userData.imageFile) {
        formData.append('ImageFile', userData.imageFile);
      }

      // Ajoutez des logs pour déboguer
      console.log('Sending data:', {
        nom: userData.nom,
        email: userData.email,
        telephone: userData.telephone,
        identifiant: userData.identifiant,
        hasPassword: !!userData.motDePasse,
        hasImage: !!userData.imageFile,
      });

      let response;
      if (currentUtilisateur) {
        response = await axios.put(
          `${API_URL}/api/utilisateurs/modifier/${currentUtilisateur.id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );
      } else {
        response = await axios.post(`${API_URL}/api/utilisateurs/ajouter-livreur`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Server response:', response.data);
      }

      fetchLivreurs();
      setOpenUserDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Afficher plus de détails sur l'erreur
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const displayedLivreurs = livreurs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const pageCount = Math.max(1, Math.ceil(livreurs.length / itemsPerPage));

  return (
    <Box component={Paper} p={3} sx={{ height: 350, ...sx }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Livreurs</Typography>
        <ButtonBase
          sx={{
            height: 36,
            width: 36,
            bgcolor: 'primary.main',
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            transition: 'background-color 0.3s ease',
          }}
          onClick={handleAddUser}
        >
          <IconifyIcon icon="ic:round-add" color="white" fontSize="h4.fontSize" />
        </ButtonBase>
      </Stack>

      <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : livreurs.length === 0 ? (
          <Typography>Aucun livreur trouvé</Typography>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, marginTop: -2 }}>
              {displayedLivreurs.map((item) => (
                <MemberCard
                  key={item.id}
                  data={item}
                  onEdit={() => handleEditUser(item)}
                  onDelete={() => handleDeleteUser(item.id)}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', py: 2 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="small"
              />
            </Box>
          </>
        )}
      </Box>

      <UtilisateurForm
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSubmit={handleSaveUser}
        initialData={currentUtilisateur || undefined}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer ce livreur ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Annuler
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Livreur;
