import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FournisseurList from './FournisseurList';
import FournisseurForm from './FournisseurForm';
import { Fournisseur } from './types';

const GestionFournisseur: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentFournisseur, setCurrentFournisseur] = useState<Fournisseur | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs/liste`);
      // Ajout du tri par date de création (du plus récent au plus ancien)
      const sortedFournisseurs = response.data.sort(
        (a: Fournisseur, b: Fournisseur) =>
          new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime(),
      );
      setFournisseurs(sortedFournisseurs);
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
        // Mise à jour - on conserve la date de création originale
        await axios.put(
          `${API_URL}/api/fournisseurs/modifier/${currentFournisseur.id}`,
          fournisseurData,
        );
      } else {
        // Création - on ajoute la date actuelle côté serveur
        await axios.post(`${API_URL}/api/fournisseurs/ajouter`, fournisseurData);
      }
      fetchFournisseurs();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur :', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/fournisseurs/supprimer/${id}`);
      fetchFournisseurs();
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur :', error);
    }
  };

  return (
    <>
      <FournisseurList
        fournisseurs={fournisseurs}
        onAddFournisseur={() => {
          setCurrentFournisseur(null);
          setOpenDialog(true);
        }}
        onEditFournisseur={(fournisseur: Fournisseur) => {
          setCurrentFournisseur(fournisseur);
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
