import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconifyIcon from 'components/base/IconifyIcon';
import paths from 'routes/paths';

interface MenuItems {
  id: number;
  title: string;
  icon: string;
  action?: () => void;
}

interface User {
  Id: number;
  Nom: string;
  Email: string;
  ImagePath?: string;
}

// Type guard for User
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' && data !== null && 'Id' in data && 'Nom' in data && 'Email' in data
  );
}

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');

      if (!userData) {
        setLoadingError('No user data found');
        return;
      }

      const parsedUser = JSON.parse(userData);

      if (!isUser(parsedUser)) {
        throw new Error('Invalid user data format');
      }

      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoadingError(error instanceof Error ? error.message : 'Unknown error');
      // Clear invalid data from storage
      localStorage.removeItem('user');
    }
  }, []);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    navigate(paths.logout);
  };

  const menuItems: MenuItems[] = [
    {
      id: 1,
      title: 'Logout',
      icon: 'material-symbols:logout',
      action: handleLogout,
    },
  ];

  // Fallback content if there's an error loading user data
  if (loadingError) {
    return (
      <Avatar
        sx={{
          height: 44,
          width: 44,
          bgcolor: 'error.main',
        }}
      >
        !
      </Avatar>
    );
  }

  return (
    <>
      <ButtonBase
        onClick={handleProfileClick}
        aria-controls={open ? 'account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        disableRipple
      >
        <Avatar
          src={`http://localhost:5283${user?.ImagePath || '/default_profile_image.png'}`}
          sx={{
            height: 44,
            width: 44,
            bgcolor: user ? 'primary.main' : 'grey.400',
          }}
        />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        sx={{
          mt: 1.5,
          '& .MuiList-root': {
            p: 0,
            width: 230,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={1}>
          <MenuItem onClick={handleProfileMenuClose} sx={{ '&:hover': { bgcolor: 'info.dark' } }}>
            <Avatar
              src={`http://localhost:5283${user?.ImagePath || '/default_profile_image.png'}`}
              sx={{ mr: 1, height: 42, width: 42 }}
            />
            <Stack direction="column">
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {user?.Nom || 'Guest User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={400}>
                {user?.Email || 'guest@example.com'}
              </Typography>
            </Stack>
          </MenuItem>
        </Box>

        <Divider sx={{ my: 0 }} />

        <Box p={1}>
          {menuItems.map((item) => (
            <MenuItem key={item.id} onClick={item.action || handleProfileMenuClose} sx={{ py: 1 }}>
              <ListItemIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 'h5.fontSize' }}>
                <IconifyIcon icon={item.icon} />
              </ListItemIcon>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {item.title}
              </Typography>
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
