import paths, { rootPaths } from './paths';

export interface SubMenuItem {
  subheader: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  items?: SubMenuItem[];
}

export interface MenuItem {
  id: number | string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  disabled?: boolean;
  items?: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 1,
    subheader: 'Dashboard',
    path: rootPaths.appRoot,
    icon: 'ic:round-home',
    active: true,
  },
  {
    id: 2,
    subheader: 'Utilisateur',
    path: paths.utilisateur,
    icon: 'ic:round-people',
    active: false,
  },
  {
    id: 3,
    subheader: 'Permission',
    path: paths.permission,
    icon: 'ic:round-lock',
    active: false,
  },
  {
    id: 4,
    subheader: 'Commande',
    path: paths.commande,
    icon: 'ic:round-receipt',
    active: false,
  },
  {
    id: 5,
    subheader: 'Livreur',
    path: paths.livreur,
    icon: 'ic:round-local-shipping',
    active: false,
  },
  {
    id: 6,
    subheader: 'Fournisseur',
    path: paths.fournisseur,
    icon: 'ic:round-business',
    active: false,
  },
  {
    id: 7,
    subheader: 'Rapport',
    path: paths.rapport,
    icon: 'ic:round-assessment',
    active: false,
  },
  {
    id: 8,
    subheader: 'Logout',
    path: paths.logout,
    icon: 'ic:round-exit-to-app',
  },
];

export default sitemap;
