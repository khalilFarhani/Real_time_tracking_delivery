import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardMenu from './CardMenu';
import { Utilisateur } from 'pages/utilisateur/types';

interface MemberCardProps {
  data: Utilisateur;
  onEdit: (livreur: Utilisateur) => void;
  onDelete: (id: number) => void;
}

const MemberCard = ({ data, onEdit, onDelete }: MemberCardProps) => {
  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {' '}
          {/* Réduit de 2 à 1.5 */}
          <Avatar
            src={data.imagePath ? `http://localhost:5283${data.imagePath}` : undefined}
            sx={{
              height: 48, // Réduit de 52 à 48
              width: 48, // Réduit de 52 à 48
              bgcolor: 'primary.main',
            }}
          >
            {!data.imagePath && data.nom.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
              {' '}
              {/* Ajout de lineHeight */}
              {data.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {' '}
              {/* Réduit la marge */}
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
