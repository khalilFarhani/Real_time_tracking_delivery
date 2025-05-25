import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
} from '@mui/material';
import {
  FormatQuote as QuoteIcon,
} from '@mui/icons-material';
import './TestimonialsSection.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Benali',
      role: 'Directrice Marketing',
      company: 'TechCorp Tunisia',
      content: 'Service exceptionnel ! Le suivi en temps réel m\'a permis de planifier parfaitement la réception de mes commandes importantes.',
      rating: 5,
      avatar: 'SB'
    },
    {
      id: 2,
      name: 'Ahmed Khelifi',
      role: 'E-commerce Manager',
      company: 'ShopTN',
      content: 'Interface intuitive et notifications précises. Mes clients sont toujours informés et satisfaits de nos livraisons.',
      rating: 5,
      avatar: 'AK'
    },
    {
      id: 3,
      name: 'Leila Mansouri',
      role: 'Propriétaire',
      company: 'Boutique Leila',
      content: 'Fiabilité et rapidité au rendez-vous. Je recommande vivement ce service à tous les professionnels.',
      rating: 4,
      avatar: 'LM'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'white' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: 'var(--gray-800)'
            }}
          >
            Ce que disent nos clients
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Découvrez les témoignages de nos clients satisfaits qui nous font confiance pour leurs livraisons
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Card
                className="testimonial-card"
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  border: '1px solid var(--gray-200)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: 20,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `var(--gradient-${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'primary'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <QuoteIcon />
                </Box>

                <CardContent sx={{ p: 4, pt: 5 }}>
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    sx={{ mb: 2 }}
                    size="small"
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'var(--gray-700)'
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `var(--${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'purple'}-color)`,
                        width: 48,
                        height: 48,
                        fontWeight: 600
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                        {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Section CTA */}
        <Box
          sx={{
            mt: 8,
            p: 6,
            borderRadius: '24px',
            background: 'var(--gradient-primary)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Rejoignez nos clients satisfaits
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Commencez dès aujourd'hui à suivre vos colis avec notre service de livraison de confiance
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                99.8%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Taux de satisfaction
              </Typography>
            </Box>
            <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.3)', mx: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                24h
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Livraison moyenne
              </Typography>
            </Box>
            <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.3)', mx: 3 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                50k+
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Clients actifs
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TestimonialsSection;
