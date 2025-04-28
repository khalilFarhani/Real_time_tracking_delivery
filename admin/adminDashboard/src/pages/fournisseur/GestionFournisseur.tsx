import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FournisseurList from './FournisseurList';
import FournisseurForm from './FournisseurForm';
import { Fournisseur } from './types';

const GestionFournisseur: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentFournisseur, setCurrentFournisseur] = useState<Fournisseur | null>(null);

  const API_URL = 'http://localhost:5283'; // Backend URL

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs/liste`);
      setFournisseurs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs :', error);
    }
  };

  const handleSave = async (fournisseurData: {
    nom: string;
    adresse: string;
    telephone: string;
    identifiant: string;
  }) => {
    try {
      if (currentFournisseur) {
        await axios.put(
          `${API_URL}/api/fournisseurs/modifier/${currentFournisseur.id}`,
          fournisseurData,
        );
      } else {
        await axios.post(`${API_URL}/api/fournisseurs/ajouter`, fournisseurData);
      }
      fetchFournisseurs(); // Refresh the list
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur :', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/fournisseurs/supprimer/${id}`);
      fetchFournisseurs(); // Refresh the list
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur :', error);
    }
  };

  return (
    <>
      <FournisseurList
        fournisseurs={fournisseurs}
        onAddFournisseur={() => {
          setCurrentFournisseur(null); // Reset for adding
          setOpenDialog(true);
        }}
        onEditFournisseur={(fournisseur: Fournisseur) => {
          setCurrentFournisseur(fournisseur); // Set fournisseur to edit
          setOpenDialog(true);
        }}
        onDeleteFournisseur={handleDelete}
      />
      <FournisseurForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={currentFournisseur || undefined}
      />
    </>
  );
};

export default GestionFournisseur;
