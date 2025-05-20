import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  styled,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface UtilisateurFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (utilisateur: {
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
    motDePasse: string;
    imageFile?: File;
  }) => void;
  initialData?: {
    id?: number;
    nom: string;
    email: string;
    telephone: string;
    identifiant: string;
    motDePasse: string;
    imagePath?: string;
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

const FormFieldContainer = styled(Box)({
  marginBottom: '16px',
});

const FieldLabel = styled(Typography)({
  marginBottom: '4px',
  fontWeight: 500,
  fontSize: '0.8rem',
});

const UtilisateurForm: React.FC<UtilisateurFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [telephone, setTelephone] = useState(initialData?.telephone || '');
  const [identifiant, setIdentifiant] = useState(initialData?.identifiant || '');
  const [motDePasse, setMotDePasse] = useState(initialData?.motDePasse || '');
  const [showPassword, setShowPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState({
    nom: { isError: false, message: '' },
    email: { isError: false, message: '' },
    telephone: { isError: false, message: '' },
    identifiant: { isError: false, message: '' },
    motDePasse: { isError: false, message: '' },
  });

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom);
      setEmail(initialData.email);
      setTelephone(initialData.telephone);
      setIdentifiant(initialData.identifiant);
      setMotDePasse(initialData.motDePasse);
    } else {
      setNom('');
      setEmail('');
      setTelephone('');
      setIdentifiant('');
      setMotDePasse('');
    }
    setImageFile(null);
    setErrors({
      nom: { isError: false, message: '' },
      email: { isError: false, message: '' },
      telephone: { isError: false, message: '' },
      identifiant: { isError: false, message: '' },
      motDePasse: { isError: false, message: '' },
    });
  }, [initialData]);

  const validateEmail = (email: string) => {
    const isValid = /^\S+@\S+\.\S+$/.test(email);
    setErrors((prev) => ({
      ...prev,
      email: {
        isError: !isValid,
        message: isValid ? '' : 'Veuillez entrer une adresse email valide',
      },
    }));
    return isValid;
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

  const handleSubmit = () => {
    const validations = [
      validateRequiredField('nom', nom),
      validateEmail(email),
      validatePhone(telephone),
      validateRequiredField('identifiant', identifiant),
      validateRequiredField('motDePasse', motDePasse),
    ];

    if (!validations.every((v) => v)) return;

    const utilisateurData = {
      nom,
      email,
      telephone,
      identifiant,
      motDePasse,
      imageFile: imageFile || undefined,
    };
    onSubmit(utilisateurData);
    onClose();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return (
      nom.trim() !== '' &&
      /^\S+@\S+\.\S+$/.test(email) &&
      /^[\d\s+-]{8,}$/.test(telephone) &&
      identifiant.trim() !== '' &&
      motDePasse.trim() !== ''
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {initialData ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <FormFieldContainer>
          <FieldLabel>Nom *</FieldLabel>
          <CompactTextField
            fullWidth
            size="small"
            value={nom}
            onChange={(e) => {
              setNom(e.target.value);
              validateRequiredField('nom', e.target.value);
            }}
            error={errors.nom.isError}
            helperText={errors.nom.message}
          />
        </FormFieldContainer>

        <FormFieldContainer>
          <FieldLabel>Email *</FieldLabel>
          <CompactTextField
            fullWidth
            size="small"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            error={errors.email.isError}
            helperText={errors.email.message}
          />
        </FormFieldContainer>

        <FormFieldContainer>
          <FieldLabel>Téléphone *</FieldLabel>
          <CompactTextField
            fullWidth
            size="small"
            value={telephone}
            onChange={(e) => {
              setTelephone(e.target.value);
              validatePhone(e.target.value);
            }}
            error={errors.telephone.isError}
            helperText={errors.telephone.message}
          />
        </FormFieldContainer>

        <FormFieldContainer>
          <FieldLabel>Identifiant *</FieldLabel>
          <CompactTextField
            fullWidth
            size="small"
            value={identifiant}
            onChange={(e) => {
              setIdentifiant(e.target.value);
              validateRequiredField('identifiant', e.target.value);
            }}
            error={errors.identifiant.isError}
            helperText={errors.identifiant.message}
          />
        </FormFieldContainer>

        <FormFieldContainer>
          <FieldLabel>Mot de passe *</FieldLabel>
          <CompactTextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            value={motDePasse}
            onChange={(e) => {
              setMotDePasse(e.target.value);
              validateRequiredField('motDePasse', e.target.value);
            }}
            error={errors.motDePasse.isError}
            helperText={errors.motDePasse.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormFieldContainer>

        <FormFieldContainer>
          <FieldLabel>Image</FieldLabel>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'block', marginTop: '8px' }}
          />
        </FormFieldContainer>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, borderTop: '1px solid #eee' }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            color: '#d32f2f',
            border: '1px solid #d32f2f',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.04)',
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          size="small"
          disabled={!isFormValid()}
        >
          {initialData ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default UtilisateurForm;
