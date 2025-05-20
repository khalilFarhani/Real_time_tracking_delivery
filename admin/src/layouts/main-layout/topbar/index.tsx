import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'assets/images/logo.png';
import Image from 'components/base/Image';
import ProfileMenu from './ProfileMenu';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      height={90}
      alignItems="center"
      justifyContent="space-between"
      bgcolor="transparent"
      zIndex={1200}
    >
      <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{
            lineHeight: 0,
            display: { xs: 'none', sm: 'block', lg: 'none' },
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.3s ease',
            },
          }}
        >
          <Image
            src={Logo}
            alt="logo"
            height={72}
            width={72}
            sx={{
              filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              transition: 'filter 0.3s ease',
            }}
          />
        </ButtonBase>

        <Toolbar sx={{ display: { xm: 'block', lg: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <IconifyIcon icon="ic:baseline-menu" />
          </IconButton>
        </Toolbar>

        {/* Suppression du bouton de recherche mobile */}
        {/* Suppression du champ de recherche */}
      </Stack>

      <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
        <ProfileMenu />
      </Stack>
    </Stack>
  );
};

export default Topbar;
