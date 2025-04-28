import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommandeList from './CommandeList';
import CommandeForm from './CommandeForm';
import CommandeDetails from './CommandeDetails';
import {
  CommandeDTO,
  CommandeDetailsDTO,
  UtilisateurIdentifiant,
  FournisseurIdentifiant,
} from './types';

const GestionCommande: React.FC = () => {
  const [commandes, setCommandes] = useState<CommandeDTO[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurIdentifiant[]>([]);
  const [fournisseurs, setFournisseurs] = useState<FournisseurIdentifiant[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentCommande, setCurrentCommande] = useState<CommandeDTO | null>(null);
  const [selectedCommande, setSelectedCommande] = useState<CommandeDetailsDTO | null>(null);

  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchCommandes();
    fetchUtilisateurs();
    fetchFournisseurs();
  }, []);

  const fetchCommandes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/commandes/liste`);
      setCommandes(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
    }
  };

  const fetchUtilisateurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/utilisateurs/identifiants`);
      setUtilisateurs(
        response.data.map((identifiant: string, index: number) => ({
          id: index + 1,
          identifiant,
        })),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/fournisseurs/identifiants`);
      setFournisseurs(
        response.data.map((identifiant: string, index: number) => ({
          id: index + 1,
          identifiant,
        })),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs :', error);
    }
  };

  const handleSave = async (commandeData: {
    statut?: string;
    utilisateurIdentifiant: string;
    fournisseurIdentifiant: string;
    description: string;
    prixUnitaire: number;
    quantite: number;
    tva: number;
    montantTotale: number;
    adressClient: string;
    nomClient: string;
    telephoneClient: string;
    emailClient: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const dataToSend = {
        ...commandeData,
        statut: currentCommande ? commandeData.statut : 'en préparation',
        prixUnitaire: Number(commandeData.prixUnitaire),
        quantite: Number(commandeData.quantite),
        tva: Number(commandeData.tva),
        latitude: Number(commandeData.latitude),
        longitude: Number(commandeData.longitude),
      };

      if (currentCommande) {
        await axios.put(`${API_URL}/api/commandes/modifier/${currentCommande.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/api/commandes/ajouter`, dataToSend);
      }
      fetchCommandes();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande :', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/commandes/supprimer/${id}`);
      fetchCommandes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande :', error);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/commandes/details/${id}`);
      setSelectedCommande(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la commande :', error);
    }
  };

  return (
    <>
      {selectedCommande ? (
        <CommandeDetails
          commande={selectedCommande}
          onBack={() => setSelectedCommande(null)}
          onPrint={() => window.print()}
        />
      ) : (
        <CommandeList
          commandes={commandes}
          onAddCommande={() => {
            setCurrentCommande(null);
            setOpenDialog(true);
          }}
          onEditCommande={(commande: CommandeDTO) => {
            setCurrentCommande(commande);
            setOpenDialog(true);
          }}
          onDeleteCommande={handleDelete}
          onViewDetails={handleViewDetails}
        />
      )}
      <CommandeForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        initialData={currentCommande || undefined}
        utilisateurs={utilisateurs}
        fournisseurs={fournisseurs}
      />
    </>
  );
};

export default GestionCommande;
