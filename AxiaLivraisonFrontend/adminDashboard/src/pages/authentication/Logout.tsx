import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rootPaths } from 'routes/paths';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('user');
    navigate(rootPaths.root);
  }, [navigate]);

  return null;
};

export default Logout;
