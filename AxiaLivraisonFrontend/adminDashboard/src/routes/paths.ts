export const rootPaths = {
  root: '/',
  authRoot: '/authentication',
  appRoot: '/app',
};

const paths = {
  signin: `${rootPaths.authRoot}/sign-in`,
  logout: `${rootPaths.authRoot}/logout`,
  utilisateur: `${rootPaths.appRoot}/utilisateur`,
  permission: `${rootPaths.appRoot}/permission`, // Add this line
  commande: `${rootPaths.appRoot}/commande`,
  livreur: `${rootPaths.appRoot}/livreur`,
  fournisseur: `${rootPaths.appRoot}/fournisseur`,
  dashboard: `${rootPaths.appRoot}`,
};

export default paths;
