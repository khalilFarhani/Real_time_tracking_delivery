import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

interface CardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const CardMenu = ({ onEdit, onDelete }: CardMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit();
    handleActionMenuClose();
  };

  const handleDelete = () => {
    onDelete();
    handleActionMenuClose();
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="card-menu"
        onClick={handleActionButtonClick}
        sx={{ bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } }}
      >
        <IconifyIcon icon="ic:baseline-more-vert" color="text.disabled" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleActionMenuClose}
        onClick={handleActionMenuClose}
        sx={{
          mt: 0.5,
          '& .MuiList-root': {
            width: 140,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon sx={{ mr: 1, fontSize: 'h5.fontSize' }}>
            <IconifyIcon icon="ic:baseline-edit" color="text.primary" />
          </ListItemIcon>
          <ListItemText>
            <Typography>Modifier</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon sx={{ mr: 1, fontSize: 'h5.fontSize' }}>
            <IconifyIcon icon="ic:baseline-delete-outline" color="error.main" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error.main">Supprimer</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CardMenu;
