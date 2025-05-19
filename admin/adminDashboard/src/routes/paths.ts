export const rootPaths = {
  root: '/',
  authRoot: '/authentication',
  appRoot: '/app',
};

const paths = {
  signin: `${rootPaths.authRoot}/sign-in`,
  logout: `${rootPaths.authRoot}/logout`,
  utilisateur: `${rootPaths.appRoot}/utilisateur`,
  permission: `${rootPaths.appRoot}/permission`,
  commande: `${rootPaths.appRoot}/commande`,
  livreur: `${rootPaths.appRoot}/livreur`,
  fournisseur: `${rootPaths.appRoot}/fournisseur`,
  dashboard: `${rootPaths.appRoot}`,
  tracking: `${rootPaths.appRoot}/tracking-page`,
};

export default paths;
