import {
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  Divider,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { EmojiEvents, LocalShipping } from '@mui/icons-material';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '24px',
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
  backdropFilter: 'blur(30px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(67, 24, 255, 0.06)',
  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4318FF, #04BEFE, #10b981, #ffd700)',
    opacity: 0,
    transition: 'all 0.6s ease',
    backgroundSize: '300% 100%',
    animation: 'shimmer 4s infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.02), rgba(4, 190, 254, 0.02))',
    borderRadius: '24px',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.6s ease',
  },
  '&:hover': {
    transform: 'translateY(-15px) scale(1.03)',
    boxShadow: '0 30px 80px rgba(67, 24, 255, 0.15), 0 12px 35px rgba(4, 190, 254, 0.1)',
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))',
    border: '2px solid rgba(67, 24, 255, 0.15)',
    '&::before': {
      opacity: 1,
    },
    '&::after': {
      opacity: 1,
      background: 'linear-gradient(135deg, rgba(67, 24, 255, 0.04), rgba(4, 190, 254, 0.04))',
    },
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-300% 0' },
    '100%': { backgroundPosition: '300% 0' },
  },
}));

const RankBadge = styled(Box)<{ rank: number }>(({ theme, rank }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '900',
  fontSize: '18px',
  color: 'white',
  background:
    rank === 1
      ? 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)'
      : rank === 2
        ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5, #c0c0c0)'
        : rank === 3
          ? 'linear-gradient(135deg, #cd7f32, #daa520, #cd7f32)'
          : 'linear-gradient(135deg, #6b7280, #9ca3af, #6b7280)',
  marginRight: theme.spacing(2),
  boxShadow:
    rank === 1
      ? '0 12px 30px rgba(255, 215, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
      : rank === 2
        ? '0 12px 30px rgba(192, 192, 192, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
        : rank === 3
          ? '0 12px 30px rgba(205, 127, 50, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
          : '0 8px 25px rgba(107, 114, 128, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
  border: rank <= 3 ? '4px solid rgba(255, 255, 255, 0.9)' : '2px solid rgba(255, 255, 255, 0.5)',
  position: 'relative',
  '&::before': {
    content: rank === 1 ? '"👑"' : rank === 2 ? '"🥈"' : rank === 3 ? '"🥉"' : '""',
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    fontSize: '20px',
    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
    animation: rank === 1 ? 'pulse 2s infinite' : 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background:
      rank === 1
        ? 'linear-gradient(45deg, #ffd700, #ff8c00, #ffd700, #ff8c00)'
        : rank === 2
          ? 'linear-gradient(45deg, #c0c0c0, #e5e5e5, #c0c0c0, #e5e5e5)'
          : rank === 3
            ? 'linear-gradient(45deg, #cd7f32, #daa520, #cd7f32, #daa520)'
            : 'linear-gradient(45deg, #6b7280, #9ca3af, #6b7280, #9ca3af)',
    backgroundSize: '400% 400%',
    animation: rank <= 3 ? 'gradientRotate 4s ease infinite' : 'none',
    zIndex: -1,
    opacity: 0.7,
  },
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.15) rotate(10deg)',
    boxShadow:
      rank === 1
        ? '0 16px 40px rgba(255, 215, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
        : rank === 2
          ? '0 16px 40px rgba(192, 192, 192, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
          : rank === 3
            ? '0 16px 40px rgba(205, 127, 50, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
            : '0 12px 35px rgba(107, 114, 128, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
  },
  '@keyframes gradientRotate': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

const AnalysisContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
  border: '2px solid rgba(99, 102, 241, 0.15)',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 2.2s cubic-bezier(0.23, 1, 0.32, 1)',
  marginTop: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    opacity: 0.9,
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.15)',
  },
}));

interface TopLivreur {
  livreurId: number;
  nomLivreur: string;
  imagePath: string;
  commandesLivrees: number;
  commandesTotales: number;
  revenusGeneres: number;
  tauxLivraison: number;
  score: number;
}

interface TopLivreursProps {
  data: {
    topLivreurs: TopLivreur[];
  } | null;
  periode: string;
  repartitionData?: Array<{
    statut: string;
    nombre: number;
    pourcentage: number;
  }>;
}

const TopLivreurs = ({ data, periode, repartitionData }: TopLivreursProps) => {
  if (!data || !data.topLivreurs) {
    return (
      <CardContent>
        <Typography variant="h6">Chargement du top des livreurs...</Typography>
      </CardContent>
    );
  }

  const getPeriodeLabel = (periode: string) => {
    switch (periode) {
      case 'jour':
        return "aujourd'hui";
      case 'semaine':
        return 'cette semaine';
      case 'mois':
        return 'ce mois';
      case 'annee':
        return 'cette année';
      default:
        return 'cette période';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const topLivreurs = data.topLivreurs || [];
  const maxScore = topLivreurs.length > 0 ? Math.max(...topLivreurs.map((l) => l.score)) : 100;

  return (
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              borderRadius: '20px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 30px rgba(255, 215, 0, 0.4)',
              position: 'relative',
              '&::before': {
                content: '"✨"',
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                fontSize: '16px',
                animation: 'sparkle 2s infinite',
              },
              '@keyframes sparkle': {
                '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
                '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: 0.8 },
              },
            }}
          >
            <Typography sx={{ fontSize: '32px' }}>🏆</Typography>
          </Box>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
            }}
          >
            Top Livreurs
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.05))',
            borderRadius: '25px',
            px: 3,
            py: 1.5,
            border: '2px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: '#ff8c00',
              fontWeight: 700,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            📅 {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      </Box>

      {topLivreurs.length === 0 ? (
        <Box textAlign="center" py={4}>
          <LocalShipping sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucun livreur actif {getPeriodeLabel(periode)}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Podium pour les 3 premiers */}
          {topLivreurs.slice(0, 3).length > 0 && (
            <Box
              mb={6}
              p={3}
              sx={{
                background:
                  'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.05))',
                borderRadius: '20px',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #ffd700, #ff8c00, #ffd700)',
                  animation: 'shimmer 3s infinite',
                },
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' },
                },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    borderRadius: '16px',
                    p: 1.5,
                    mr: 1.5,
                    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
                  }}
                >
                  <Typography sx={{ fontSize: '24px' }}>🥇</Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  Podium des Champions
                </Typography>
              </Box>

              <Box display="flex" justifyContent="center" alignItems="end" gap={4}>
                {/* 2ème place */}
                {topLivreurs[1] && (
                  <Box textAlign="center" sx={{ transform: 'translateY(15px)' }}>
                    <Box
                      sx={{
                        height: 80,
                        width: 65,
                        background: 'linear-gradient(135deg, #c0c0c0, #e5e5e5)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5,
                        mx: 'auto',
                        boxShadow: '0 8px 20px rgba(192, 192, 192, 0.4)',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        position: 'relative',
                        '&::before': {
                          content: '"🥈"',
                          position: 'absolute',
                          top: '-12px',
                          fontSize: '20px',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        },
                      }}
                    >
                      <Typography variant="h5" color="white" fontWeight="800" sx={{ mt: 0.5 }}>
                        2
                      </Typography>
                    </Box>
                    <Avatar
                      src={
                        topLivreurs[1].imagePath
                          ? `http://localhost:5283${topLivreurs[1].imagePath}`
                          : undefined
                      }
                      sx={{
                        width: 50,
                        height: 50,
                        mx: 'auto',
                        mb: 0.5,
                        border: '3px solid #c0c0c0',
                        boxShadow: '0 6px 15px rgba(192, 192, 192, 0.3)',
                      }}
                    >
                      {topLivreurs[1].nomLivreur.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      fontWeight="700"
                      noWrap
                      sx={{ color: '#374151' }}
                    >
                      {topLivreurs[1].nomLivreur}
                    </Typography>
                    <Box
                      sx={{
                        background:
                          'linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(229, 229, 229, 0.1))',
                        borderRadius: '12px',
                        px: 2,
                        py: 0.5,
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                        🚚 {topLivreurs[1].commandesLivrees} livraisons
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* 1ère place */}
                <Box textAlign="center">
                  <Box
                    sx={{
                      height: 100,
                      width: 75,
                      background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      mx: 'auto',
                      boxShadow: '0 15px 40px rgba(255, 215, 0, 0.5)',
                      border: '4px solid rgba(255, 255, 255, 0.9)',
                      position: 'relative',
                      '&::before': {
                        content: '"👑"',
                        position: 'absolute',
                        top: '-20px',
                        fontSize: '32px',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        animation: 'bounce 2s infinite',
                      },
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-5px)' },
                      },
                    }}
                  >
                    <Typography
                      variant="h3"
                      color="white"
                      fontWeight="900"
                      sx={{ mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    >
                      1
                    </Typography>
                  </Box>
                  <Avatar
                    src={
                      topLivreurs[0].imagePath
                        ? `http://localhost:5283${topLivreurs[0].imagePath}`
                        : undefined
                    }
                    sx={{
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 0.5,
                      border: '4px solid #ffd700',
                      boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)',
                    }}
                  >
                    {topLivreurs[0].nomLivreur.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" fontWeight="800" noWrap sx={{ color: '#1f2937' }}>
                    {topLivreurs[0].nomLivreur}
                  </Typography>
                  <Box
                    sx={{
                      background:
                        'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.2))',
                      borderRadius: '16px',
                      px: 3,
                      py: 1,
                      mt: 1,
                      border: '2px solid rgba(255, 215, 0, 0.4)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#b45309', fontWeight: 700 }}>
                      🏆 {topLivreurs[0].commandesLivrees} livraisons
                    </Typography>
                  </Box>
                </Box>

                {/* 3ème place */}
                {topLivreurs[2] && (
                  <Box textAlign="center" sx={{ transform: 'translateY(20px)' }}>
                    <Box
                      sx={{
                        height: 70,
                        width: 60,
                        background: 'linear-gradient(135deg, #cd7f32, #daa520)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                        boxShadow: '0 10px 25px rgba(205, 127, 50, 0.4)',
                        border: '3px solid rgba(255, 255, 255, 0.7)',
                        position: 'relative',
                        '&::before': {
                          content: '"🥉"',
                          position: 'absolute',
                          top: '-12px',
                          fontSize: '20px',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        },
                      }}
                    >
                      <Typography variant="h5" color="white" fontWeight="800">
                        3
                      </Typography>
                    </Box>
                    <Avatar
                      src={
                        topLivreurs[2].imagePath
                          ? `http://localhost:5283${topLivreurs[2].imagePath}`
                          : undefined
                      }
                      sx={{
                        width: 45,
                        height: 45,
                        mx: 'auto',
                        mb: 0.5,
                        border: '2px solid #cd7f32',
                        boxShadow: '0 5px 12px rgba(205, 127, 50, 0.3)',
                      }}
                    >
                      {topLivreurs[2].nomLivreur.charAt(0)}
                    </Avatar>
                    <Typography variant="body1" fontWeight="600" noWrap sx={{ color: '#374151' }}>
                      {topLivreurs[2].nomLivreur}
                    </Typography>
                    <Box
                      sx={{
                        background:
                          'linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(218, 165, 32, 0.1))',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.5,
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                        🥉 {topLivreurs[2].commandesLivrees} livraisons
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Liste complète */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {topLivreurs.map((livreur, index: number) => (
              <div key={livreur.livreurId}>
                <StyledListItem>
                  <Box display="flex" alignItems="center" width="100%">
                    <RankBadge rank={index + 1}>{index + 1}</RankBadge>

                    <Box sx={{ mr: 3 }}>
                      <Avatar
                        src={
                          livreur.imagePath
                            ? `http://localhost:5283${livreur.imagePath}`
                            : undefined
                        }
                        sx={{
                          width: 65,
                          height: 65,
                          border: '4px solid',
                          borderColor:
                            index === 0
                              ? '#ffd700'
                              : index === 1
                                ? '#c0c0c0'
                                : index === 2
                                  ? '#cd7f32'
                                  : '#6b7280',
                          boxShadow:
                            index === 0
                              ? '0 8px 25px rgba(255, 215, 0, 0.4)'
                              : index === 1
                                ? '0 8px 25px rgba(192, 192, 192, 0.4)'
                                : index === 2
                                  ? '0 8px 25px rgba(205, 127, 50, 0.4)'
                                  : '0 6px 20px rgba(107, 114, 128, 0.3)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow:
                              index === 0
                                ? '0 12px 35px rgba(255, 215, 0, 0.6)'
                                : index === 1
                                  ? '0 12px 35px rgba(192, 192, 192, 0.6)'
                                  : index === 2
                                    ? '0 12px 35px rgba(205, 127, 50, 0.6)'
                                    : '0 10px 30px rgba(107, 114, 128, 0.5)',
                          },
                        }}
                      >
                        {livreur.nomLivreur.charAt(0)}
                      </Avatar>
                    </Box>

                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {livreur.nomLivreur}
                          </Typography>
                          {index < 3 && (
                            <EmojiEvents
                              sx={{
                                color:
                                  index === 0 ? '#4318FF' : index === 1 ? '#05CD99' : '#04BEFE',
                                fontSize: 20,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {livreur.commandesLivrees}/{livreur.commandesTotales} commandes
                            </Typography>
                            <Chip
                              label={`${livreur.tauxLivraison}%`}
                              size="small"
                              color={
                                livreur.tauxLivraison >= 90
                                  ? 'success'
                                  : livreur.tauxLivraison >= 70
                                    ? 'warning'
                                    : 'error'
                              }
                              variant="outlined"
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(livreur.score / maxScore) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                backgroundColor:
                                  index === 0
                                    ? '#4318FF'
                                    : index === 1
                                      ? '#05CD99'
                                      : index === 2
                                        ? '#04BEFE'
                                        : '#707EAE', // Gray from theme
                              },
                            }}
                          />
                          <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              💰 {formatCurrency(livreur.revenusGeneres)}
                            </Typography>
                            <Typography variant="caption" color="primary" fontWeight="bold">
                              Score: {Math.round(livreur.score)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                </StyledListItem>
                {index < topLivreurs.length - 1 && <Divider variant="inset" />}
              </div>
            ))}
          </List>

          {/* Légende */}
          <Box mt={4} p={2} sx={{ backgroundColor: 'rgba(67, 24, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Score calculé :</strong> Nombre de livraisons (60%) + Taux de livraison
              (40%)
            </Typography>
          </Box>
        </>
      )}

      {/* Analyse intelligente */}
      <Box mt={8}>
        <Fade in timeout={4000}>
          <AnalysisContainer>
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              mb={2}
              sx={{
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-3px)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'scale(1.3) rotate(15deg) translateY(-5px)',
                    filter: 'drop-shadow(0 8px 25px rgba(255, 193, 7, 0.6))',
                  },
                }}
              >
                💡
              </Typography>
              <Typography
                variant="h6"
                fontWeight="700"
                color="#6366f1"
                sx={{
                  transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    transform: 'scale(1.1) translateY(-2px)',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                  },
                }}
              >
                Analyse Intelligente
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              fontWeight="500"
              lineHeight={1.6}
              sx={{
                transition: 'all 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                '&:hover': {
                  transform: 'scale(1.02) translateY(-2px)',
                  color: '#374151',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              {(() => {
                if (!repartitionData || repartitionData.length === 0) {
                  return '📊 Analysez les performances de vos livreurs pour optimiser les livraisons et améliorer la satisfaction client.';
                }

                const livreePct =
                  repartitionData.find(
                    (item) =>
                      item.statut.toLowerCase() === 'livré' ||
                      item.statut.toLowerCase() === 'livre',
                  )?.pourcentage || 0;

                if (livreePct >= 80) {
                  return '🎉 Excellent taux de livraison ! Les livreurs performent très bien et maintiennent un service de qualité exceptionnelle.';
                } else if (livreePct >= 60) {
                  return "📈 Bon taux de livraison, mais il y a encore de la marge d'amélioration pour optimiser les performances.";
                } else {
                  return "⚠️ Le taux de livraison nécessite une attention particulière. Il serait bénéfique d'analyser les causes et d'implémenter des améliorations.";
                }
              })()}
            </Typography>
          </AnalysisContainer>
        </Fade>
      </Box>
    </CardContent>
  );
};

export default TopLivreurs;
