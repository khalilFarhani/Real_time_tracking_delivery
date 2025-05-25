import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rootPaths } from 'routes/paths';
import { authService } from 'services/authService';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        navigate(rootPaths.root);
      }
    };

    performLogout();
  }, [navigate]);

  return null;
};

export default Logout;
