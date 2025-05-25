import { Suspense, lazy } from 'react';
import { Outlet, createBrowserRouter } from 'react-router-dom';
import paths, { rootPaths } from './paths';

const App = lazy(() => import('App'));
const MainLayout = lazy(() => import('layouts/main-layout'));
const AuthLayout = lazy(() => import('layouts/auth-layout'));
const AuthGuard = lazy(() => import('components/auth/AuthGuard'));
const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
const SignIn = lazy(() => import('pages/authentication/SignIn'));
const Logout = lazy(() => import('pages/authentication/Logout'));
const Page404 = lazy(() => import('pages/errors/Page404'));
const TrackingPage = lazy(() => import('pages/tracking/TrackingPage'));

const GestionUtilisateur = lazy(() => import('pages/utilisateur/GestionUtilisateur'));
const GestionPermission = lazy(() => import('pages/permission/GestionPermission'));
const GestionCommande = lazy(() => import('pages/commande/GestionCommande'));
const GestionLivreur = lazy(() => import('pages/livreur/GestionLivreur'));
const GestionFournisseur = lazy(() => import('pages/fournisseur/GestionFournisseur'));
const CommandeDetailsPage = lazy(() => import('pages/commande/CommandeDetailsPage'));
const CommandeMapPage = lazy(() => import('pages/commande/CommandeMapPage'));

import PageLoader from 'components/loading/PageLoader';
import Progress from 'components/loading/Progress';

export const routes = [
  {
    element: (
      <Suspense fallback={<Progress />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: rootPaths.root,
        element: (
          <AuthLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AuthLayout>
        ),
        children: [
          {
            index: true,
            element: <SignIn />,
          },
          {
            path: paths.logout,
            element: <Logout />,
          },
        ],
      },
      {
        path: rootPaths.appRoot,
        element: (
          <AuthGuard>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: paths.utilisateur,
            element: <GestionUtilisateur />,
          },
          {
            path: paths.permission,
            element: <GestionPermission />,
          },
          {
            path: paths.commande,
            element: <GestionCommande />,
          },
          {
            path: paths.commande + '/details/:id',
            element: <CommandeDetailsPage />,
          },
          {
            path: paths.commande + '/map/:id',
            element: <CommandeMapPage />,
          },
          {
            path: paths.livreur,
            element: <GestionLivreur />,
          },
          {
            path: paths.fournisseur,
            element: <GestionFournisseur />,
          },
          {
            path: 'tracking-page',
            element: <TrackingPage />,
          },
        ],
      },
      {
        path: '*',
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/horizon' });

export default router;
