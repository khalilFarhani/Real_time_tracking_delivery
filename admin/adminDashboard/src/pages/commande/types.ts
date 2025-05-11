export interface Commande {
  id: number;
  codeSuivi: string;
  dateCreation: string;
  statut: string;
  utilisateurId: number;
  utilisateurIdentifiant: string;
  fournisseurId: number;
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
}

export interface CommandeDTO {
  id: number;
  statut: string;
  utilisateurIdentifiant: string;
  fournisseurIdentifiant: string;
  quantite: number;
  montantTotale: number;
  adressClient: string;
  nomClient: string;
  telephoneClient: string;
  emailClient: string;
  description: string;
  prixUnitaire: number;
  montantHorsTax: number;
  tva: number;
  dateCreation?: string;
}

export interface CommandeDetailsDTO extends CommandeDTO {
  codeSuivi?: string;
  fournisseur?: FournisseurDTO;
  utilisateur?: UtilisateurDTO;
}

export interface FournisseurDTO {
  nom: string;
  adresse: string;
  telephone: string;
  identifiant: string;
}

export interface UtilisateurDTO {
  nom: string;
  email: string;
  telephone: string;
  identifiant: string;
}

export interface UtilisateurIdentifiant {
  id: number;
  identifiant: string;
}

export interface FournisseurIdentifiant {
  id: number;
  identifiant: string;
}
