import { Outlet, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import { rootPaths } from 'routes/paths';

interface AuthLayoutProps {
  children?: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate(rootPaths.appRoot); // Rediriger vers l'application si l'utilisateur est déjà connecté
    }
  }, [navigate]);

  return (
    <Stack justifyContent="center" alignItems="center" height="100vh" bgcolor="info.lighter">
      <Stack
        direction="column"
        alignItems="center"
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 3,
        }}
      >
        {children || <Outlet />}
      </Stack>
    </Stack>
  );
};

export default AuthLayout;
