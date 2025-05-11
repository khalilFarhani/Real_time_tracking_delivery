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

const AssistantAdmin = () => {
  const [assistants, setAssistants] = useState<Utilisateur[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState<Utilisateur | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const itemsPerPage = 3;
  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      console.log('Récupération des assistants...');
      const response = await axios.get(`${API_URL}/api/utilisateurs/liste`);
      console.log('Assistants récupérés:', response.data);
      setAssistants(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des assistants:', error);
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAddUser = () => {
    console.log("Ouverture du formulaire d'ajout");
    setCurrentUtilisateur(null);
    setOpenUserDialog(true);
  };

  const handleEditUser = (utilisateur: Utilisateur) => {
    console.log("Modification de l'utilisateur:", utilisateur);
    setCurrentUtilisateur(utilisateur);
    setOpenUserDialog(true);
  };

  const handleDeleteUser = (id: number) => {
    console.log("Demande de suppression de l'utilisateur avec ID:", id);
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        console.log("Suppression de l'utilisateur avec ID:", userToDelete);

        // Utiliser l'URL correcte pour la suppression
        await axios.delete(`${API_URL}/api/utilisateurs/supprimer/${userToDelete}`);
        console.log('Utilisateur supprimé avec succès');

        // Rafraîchir la liste après la suppression
        await fetchAssistants();

        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        if (axios.isAxiosError(error)) {
          console.error("Détails de l'erreur:", error.response?.data);
        }
      }
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
      console.log('Sauvegarde des données utilisateur:', userData);

      const formData = new FormData();
      formData.append('Nom', userData.nom);
      formData.append('Email', userData.email);
      formData.append('Telephone', userData.telephone);
      formData.append('Identifiant', userData.identifiant);
      formData.append('MotDePasse', userData.motDePasse);

      if (userData.imageFile) {
        formData.append('ImageFile', userData.imageFile);
        console.log('Image ajoutée au formulaire');
      }

      if (currentUtilisateur) {
        console.log("Mise à jour de l'utilisateur avec ID:", currentUtilisateur.id);
        await axios.put(`${API_URL}/api/utilisateurs/modifier/${currentUtilisateur.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Utilisateur mis à jour avec succès');
      } else {
        console.log("Ajout d'un nouvel utilisateur");
        await axios.post(`${API_URL}/api/utilisateurs/ajouter`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Nouvel utilisateur ajouté avec succès');
      }

      // Rafraîchir la liste après l'ajout/modification
      await fetchAssistants();
      setOpenUserDialog(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur:", error.response?.data);
      }
    }
  };

  // Calculer les assistants à afficher sur la page actuelle
  const displayedAssistants = assistants.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Calculer le nombre de pages (minimum 1)
  const pageCount = Math.max(1, Math.ceil(assistants.length / itemsPerPage));

  return (
    <Box component={Paper} p={3} height="auto" minHeight={390}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Administrateurs Assistants</Typography>
        <ButtonBase
          sx={{
            height: 36,
            width: 36,
            bgcolor: 'primary.main', // Changé de 'info.main' à 'primary.main' pour avoir un bouton bleu
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Ajout d'une légère ombre
            '&:hover': {
              bgcolor: 'primary.dark', // Effet hover plus foncé
            },
            transition: 'background-color 0.3s ease', // Transition douce
          }}
          onClick={handleAddUser}
        >
          <IconifyIcon icon="ic:round-add" color="white" fontSize="h4.fontSize" />
        </ButtonBase>
      </Stack>

      <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <>
            <Box sx={{ flexGrow: 1 }}>
              {displayedAssistants.map((item) => (
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

      {/* Formulaire d'ajout/modification d'utilisateur */}
      <UtilisateurForm
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSubmit={handleSaveUser}
        initialData={currentUtilisateur || undefined}
      />

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Confirmer la suppression'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
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

export default AssistantAdmin;
