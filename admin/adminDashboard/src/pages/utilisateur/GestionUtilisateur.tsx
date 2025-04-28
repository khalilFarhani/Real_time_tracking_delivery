import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UtilisateurList from './UtilisateurList';
import UtilisateurForm from './UtilisateurForm';
import { Utilisateur } from './types';

const GestionUtilisateur: React.FC = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [openUserDialog, setOpenUserDialog] = useState<boolean>(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState<Utilisateur | null>(null);
  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/utilisateurs/liste`);
      setUtilisateurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };

  const handleSaveUser = async (utilisateurData: {
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
    motDePasse: string;
    imageFile?: File;
  }) => {
    const formData = new FormData();
    formData.append('Nom', utilisateurData.nom);
    formData.append('Email', utilisateurData.email);
    formData.append('Telephone', utilisateurData.telephone);
    formData.append('Identifiant', utilisateurData.identifiant);
    formData.append('MotDePasse', utilisateurData.motDePasse);
    if (utilisateurData.imageFile) {
      formData.append('ImageFile', utilisateurData.imageFile);
    }

    try {
      if (currentUtilisateur) {
        await axios.put(`${API_URL}/api/utilisateurs/modifier/${currentUtilisateur.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/api/utilisateurs/ajouter`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchUtilisateurs();
      setOpenUserDialog(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur :", error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/utilisateurs/supprimer/${id}`);
      fetchUtilisateurs();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
  };

  return (
    <>
      <UtilisateurList
        utilisateurs={utilisateurs}
        onAddUtilisateur={() => {
          setCurrentUtilisateur(null);
          setOpenUserDialog(true);
        }}
        onEditUtilisateur={(utilisateur) => {
          setCurrentUtilisateur(utilisateur);
          setOpenUserDialog(true);
        }}
        onDeleteUtilisateur={handleDeleteUser}
      />

      <UtilisateurForm
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        onSubmit={handleSaveUser}
        initialData={currentUtilisateur || undefined}
      />
    </>
  );
};

export default GestionUtilisateur;
