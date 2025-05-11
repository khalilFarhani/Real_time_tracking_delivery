export interface Commande {
  id: number;
  nomClient: string;
  statut: string;
  dateCreation?: string;
  montantTotale: number;
  fournisseurIdentifiant?: string;
  utilisateurIdentifiant?: string;
  quantite?: number;
  adressClient?: string;
  telephoneClient?: string;
  emailClient?: string;
  description?: string;
  prixUnitaire?: number;
  montantHorsTax?: number;
  tva?: number;
  codeSuivi?: string;
  fournisseur?: {
    nom: string;
    adresse: string;
    telephone: string;
    identifiant: string;
  };
  utilisateur?: {
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
  };
}
