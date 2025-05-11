import React from 'react';
import CommandeDetails from 'pages/commande/CommandeDetailsPage';

// Ajouter cette route dans votre fichier de routes
const routes = [
  {
    path: '/commande/details/:id',
    element: <CommandeDetails />,
  },
];

export default routes;
