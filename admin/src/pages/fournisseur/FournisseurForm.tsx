import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Box,
  styled,
} from '@mui/material';
import { Business, Phone, LocationOn, Badge } from '@mui/icons-material';

interface FournisseurFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fournisseur: {
    nom: string;
    adresse: string;
    telephone: string;
    identifiant: string;
  }) => void;
  initialData?: {
    id?: number;
    nom: string;
    adresse: string;
    telephone: string;
    identifiant: string;
  };
}

const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '16px',
    width: '600px',
    maxWidth: '100%',
  },
});

const CompactTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    height: '40px',
    '& fieldset': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor:
        theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
    },
    '&.Mui-focused fieldset': {
      borderWidth: '0px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
    color: theme.palette.error.main,
  },
}));

const FieldContainer = styled(Box)({
  marginBottom: '16px',
});

const FieldLabel = styled(Typography)({
  marginBottom: '4px',
  fontWeight: 500,
  fontSize: '0.8rem',
});

const FournisseurForm: React.FC<FournisseurFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    identifiant: '',
  });

  const [errors, setErrors] = useState({
    nom: { isError: false, message: '' },
    identifiant: { isError: false, message: '' },
    telephone: { isError: false, message: '' },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom,
        adresse: initialData.adresse,
        telephone: initialData.telephone,
        identifiant: initialData.identifiant,
      });
    } else {
      setFormData({
        nom: '',
        adresse: '',
        telephone: '',
        identifiant: '',
      });
    }
    setErrors({
      nom: { isError: false, message: '' },
      identifiant: { isError: false, message: '' },
      telephone: { isError: false, message: '' },
    });
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'telephone') {
      validatePhone(value);
    } else if (['nom', 'identifiant'].includes(name)) {
      validateRequiredField(name, value);
    }
  };

  const validatePhone = (phone: string) => {
    const isValid = /^[\d\s+-]{8,}$/.test(phone);
    setErrors((prev) => ({
      ...prev,
      telephone: {
        isError: !isValid,
        message: isValid ? '' : 'Le numéro doit contenir au moins 8 chiffres',
      },
    }));
    return isValid;
  };

  const validateRequiredField = (field: string, value: string) => {
    const isValid = value.trim() !== '';
    setErrors((prev) => ({
      ...prev,
      [field]: {
        isError: !isValid,
        message: isValid ? '' : 'Ce champ est obligatoire',
      },
    }));
    return isValid;
  };

  const validateForm = () => {
    const validations = [
      validateRequiredField('nom', formData.nom),
      validateRequiredField('identifiant', formData.identifiant),
      validatePhone(formData.telephone),
    ];
    return validations.every((v) => v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      nom: formData.nom.trim(),
      adresse: formData.adresse.trim(),
      telephone: formData.telephone.trim(),
      identifiant: formData.identifiant.trim(),
    });
  };

  const isFormValid = () => {
    return (
      formData.nom.trim() !== '' &&
      formData.identifiant.trim() !== '' &&
      /^[\d\s+-]{8,}$/.test(formData.telephone)
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {initialData ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <FieldContainer>
            <FieldLabel>Nom du fournisseur *</FieldLabel>
            <CompactTextField
              name="nom"
              fullWidth
              margin="none"
              required
              error={errors.nom.isError}
              helperText={errors.nom.message}
              value={formData.nom}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Identifiant unique *</FieldLabel>
            <CompactTextField
              name="identifiant"
              fullWidth
              margin="none"
              required
              error={errors.identifiant.isError}
              helperText={errors.identifiant.message}
              value={formData.identifiant}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Numéro de téléphone *</FieldLabel>
            <CompactTextField
              name="telephone"
              fullWidth
              margin="none"
              required
              error={errors.telephone.isError}
              helperText={errors.telephone.message}
              value={formData.telephone}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <FieldLabel>Adresse</FieldLabel>
            <CompactTextField
              name="adresse"
              fullWidth
              margin="none"
              multiline
              rows={1}
              value={formData.adresse}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            size="small"
            sx={{
              color: '#d32f2f',
              border: '1px solid #d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
              mr: 1,
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            size="small"
            disabled={!isFormValid()}
          >
            {initialData ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </StyledDialog>
  );
};

export default FournisseurForm;
