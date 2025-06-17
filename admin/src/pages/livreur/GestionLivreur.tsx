import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LivreurList from './LivreurList';
import LivreurForm from './LivreurForm';
import { Utilisateur } from './types';

const GestionLivreur: React.FC = () => {
  const [livreurs, setLivreurs] = useState<Utilisateur[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentLivreur, setCurrentLivreur] = useState<Utilisateur | null>(null);

  const API_URL = 'http://localhost:5283'; // Backend URL

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/utilisateurs/livreurs`);
      setLivreurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs :', error);
    }
  };

  const handleSave = async (livreurData: {
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
    motDePasse: string;
    imageFile?: File;
  }) => {
    const formData = new FormData();
    formData.append('Nom', livreurData.nom);
    formData.append('Email', livreurData.email);
    formData.append('Telephone', livreurData.telephone);
    formData.append('Identifiant', livreurData.identifiant);
    formData.append('MotDePasse', livreurData.motDePasse);
    if (livreurData.imageFile) {
      formData.append('ImageFile', livreurData.imageFile);
    }

    try {
      if (currentLivreur) {
        await axios.put(`${API_URL}/api/utilisateurs/modifier/${currentLivreur.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/api/utilisateurs/ajouter-livreur`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchLivreurs(); // Refresh the list
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du livreur :', error);
    }
  };

  const handleDelete = async () => {
    // Refresh the list after deletion
    fetchLivreurs();
  };

  return (
    <>
      <LivreurList
        livreurs={livreurs}
        onAddLivreur={() => {
          setCurrentLivreur(null); // Reset for adding
          setOpenDialog(true);
        }}
        onEditLivreur={(livreur: Utilisateur) => {
          setCurrentLivreur(livreur); // Set livreur to edit
          setOpenDialog(true);
        }}
        onDeleteLivreur={handleDelete}
      />
      <LivreurForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={currentLivreur || undefined}
      />
    </>
  );
};

export default GestionLivreur;
