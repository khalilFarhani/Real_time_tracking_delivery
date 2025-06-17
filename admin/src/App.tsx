// Importer le composant Outlet de React Router pour afficher les routes enfants
import { Outlet } from 'react-router-dom';

// Composant principal de l'application admin
const App = () => {
  // Retourner l'Outlet qui affichera le contenu des routes
  return <Outlet />;
};

// Exporter le composant App comme export par défaut
export default App;
