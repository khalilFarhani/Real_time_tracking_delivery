import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardMenu from './CardMenu';
import { Utilisateur } from 'pages/utilisateur/types';
import { SxProps } from '@mui/material';

interface MemberCardProps {
  data: Utilisateur;
  onEdit: (assistant: Utilisateur) => void;
  onDelete: (id: number) => void;
  sx?: SxProps;
}

const MemberCard = ({ data, onEdit, onDelete, sx }: MemberCardProps) => {
  return (
    <Box
      sx={{
        p: 2.5,
        mb: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        // Suppression de la bordure
        // border: '1px solid',
        // borderColor: 'divider',
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            src={data.imagePath ? `http://localhost:5283${data.imagePath}` : undefined}
            sx={{
              height: 52,
              width: 52,
              bgcolor: 'primary.main',
            }}
          >
            {!data.imagePath && data.nom.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {data.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.identifiant}
            </Typography>
          </Box>
        </Stack>
        <CardMenu onEdit={() => onEdit(data)} onDelete={() => onDelete(data.id)} />
      </Stack>
    </Box>
  );
};

export default MemberCard;
