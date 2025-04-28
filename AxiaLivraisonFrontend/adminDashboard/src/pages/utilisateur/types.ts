import { Permission } from '../permission/types';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  identifiant: string;
  motDePasse: string;
  imagePath?: string;
  estAdmin: boolean;
  estLivreur: boolean;
}

export interface UtilisateurAvecPermissions {
  id: number;
  nom: string;
  email: string;
  permissions: Permission[];
}
