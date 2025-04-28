import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link, Box, List, Stack, ButtonBase, Typography } from '@mui/material';
import Image from 'components/base/Image';
import Logo from 'assets/images/logo.png';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import sitemap, { MenuItem } from 'routes/sitemap';
import paths from 'routes/paths';

interface User {
  EstAdmin?: boolean;
  Permissions?: {
    permissionName: string;
    description?: string;
  }[];
}

interface ApiPermission {
  id: number;
  permissionName: string;
  description?: string;
}

const API_URL = 'http://localhost:5283';

const DrawerItems = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeItem, setActiveItem] = useState<string | number>(1);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = localStorage.getItem('user');
        if (userData && userData !== 'undefined') {
          const parsedUser = JSON.parse(userData) as User;
          setUser(parsedUser);
        }

        const response = await axios.get<ApiPermission[]>(`${API_URL}/api/permissions/liste`);
        setAvailablePermissions(response.data.map((p) => p.permissionName));
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setAvailablePermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (location.pathname !== paths.logout) {
      const currentRoute = sitemap.find((item) => item.path === location.pathname);
      if (currentRoute) setActiveItem(currentRoute.id);
    }
  }, [location.pathname]);

  const requiresPermission = (subheader: string): boolean => {
    return availablePermissions.includes(subheader);
  };

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;
    if (user.EstAdmin) return true;
    return (
      user.Permissions?.some(
        (p) => p.permissionName.toLowerCase() === requiredPermission.toLowerCase(),
      ) ?? false
    );
  };

  const shouldShowItem = (route: MenuItem): boolean => {
    if (
      (route.subheader === 'Utilisateur' || route.subheader === 'Permission') &&
      !user?.EstAdmin
    ) {
      return false;
    }
    return true;
  };

  const handleItemClick = (id: string | number) => {
    setActiveItem(id);
  };

  const isItemActive = (route: MenuItem): boolean => {
    if (route.subheader === 'Logout') return true;
    return activeItem === route.id;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Chargement du menu...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography>Erreur: {error}</Typography>
        <Typography variant="body2">Certaines fonctionnalités peuvent être limitées</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack
        pt={5}
        pb={4.5}
        px={4.5}
        justifyContent="flex-start"
        position="sticky"
        top={0}
        borderBottom={1}
        borderColor="info.main"
        bgcolor="info.lighter"
        zIndex={1000}
      >
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.3s ease',
            },
          }}
        >
          <Image
            src={Logo}
            alt="logo"
            height={96}
            width={96}
            sx={{
              mr: 1.75,
              borderRadius: '15px',
              filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              transition: 'filter 0.3s ease',
            }}
          />
        </ButtonBase>
      </Stack>

      <List component="nav" sx={{ mt: 2.5, mb: 10, p: 0, pl: 3 }}>
        {sitemap
          .filter((route) => shouldShowItem(route))
          .map((route) => {
            const isActive = isItemActive(route);
            const itemProps = {
              ...route,
              active: isActive,
              onClick: () => handleItemClick(route.id),
            };

            if (!requiresPermission(route.subheader)) {
              return (
                <Box key={route.id}>
                  {route.items ? <CollapseListItem {...itemProps} /> : <ListItem {...itemProps} />}
                </Box>
              );
            }

            const userHasAccess = hasPermission(route.subheader);

            return (
              <Box
                key={route.id}
                sx={
                  !userHasAccess
                    ? {
                        opacity: 0.6,
                        pointerEvents: 'none',
                        '&:hover': {
                          backgroundColor: 'transparent',
                        },
                      }
                    : {}
                }
              >
                {route.items ? (
                  <CollapseListItem {...itemProps} disabled={!userHasAccess} />
                ) : (
                  <ListItem {...itemProps} disabled={!userHasAccess} />
                )}
              </Box>
            );
          })}
      </List>

      <Box mt="auto" px={3} pt={15} pb={5}></Box>
    </>
  );
};

export default DrawerItems;
