import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  InputAdornment,
  Divider,
  Box,
  styled,
} from '@mui/material';

interface User {
  id: number;
  identifiant: string;
}

interface Supplier {
  id: number;
  identifiant: string;
}

interface FormData {
  statut: string;
  utilisateurIdentifiant: string;
  fournisseurIdentifiant: string;
  description: string;
  prixUnitaire: number;
  quantite: number;
  tva: number;
  adressClient: string;
  nomClient: string;
  telephoneClient: string;
  emailClient: string;
  latitude: number;
  longitude: number;
}

interface CommandeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FormData, 'statut'> & { statut?: string }) => void;
  initialData?: Partial<FormData>;
  utilisateurs: User[];
  fournisseurs: Supplier[];
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

const CompactSelect = styled(TextField)(({ theme }) => ({
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
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    marginRight: 0,
    color: theme.palette.error.main,
  },
}));

const SectionBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.primary.dark,
  marginBottom: theme.spacing(1),
}));

const FormFieldContainer = styled(Box)({
  marginBottom: '16px',
});

const FieldLabel = styled(Typography)({
  marginBottom: '4px',
  fontWeight: 500,
  fontSize: '0.8rem',
});

const TotalDisplay = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(1.5),
  borderRadius: 6,
  textAlign: 'right',
  fontWeight: 600,
  fontSize: '1rem',
  marginTop: theme.spacing(1.5),
  border: '1px solid rgba(0, 0, 0, 0.12)',
}));

const CommandeForm: React.FC<CommandeFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  utilisateurs,
  fournisseurs,
}) => {
  const [formData, setFormData] = useState<FormData>({
    statut: 'en préparation',
    utilisateurIdentifiant: '',
    fournisseurIdentifiant: '',
    description: '',
    prixUnitaire: 0,
    quantite: 0,
    tva: 0,
    adressClient: '',
    nomClient: '',
    telephoneClient: '',
    emailClient: '',
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState({
    utilisateurIdentifiant: { isError: false, message: '' },
    fournisseurIdentifiant: { isError: false, message: '' },
    prixUnitaire: { isError: false, message: '' },
    quantite: { isError: false, message: '' },
    nomClient: { isError: false, message: '' },
    telephoneClient: { isError: false, message: '' },
    adressClient: { isError: false, message: '' },
    emailClient: { isError: false, message: '' },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        statut: initialData.statut ?? 'en préparation',
        utilisateurIdentifiant: initialData.utilisateurIdentifiant ?? '',
        fournisseurIdentifiant: initialData.fournisseurIdentifiant ?? '',
        description: initialData.description ?? '',
        prixUnitaire: initialData.prixUnitaire ?? 0,
        quantite: initialData.quantite ?? 0,
        tva: initialData.tva ?? 0,
        adressClient: initialData.adressClient ?? '',
        nomClient: initialData.nomClient ?? '',
        telephoneClient: initialData.telephoneClient ?? '',
        emailClient: initialData.emailClient ?? '',
        latitude: initialData.latitude ?? 0,
        longitude: initialData.longitude ?? 0,
      });
    }
    setErrors({
      utilisateurIdentifiant: { isError: false, message: '' },
      fournisseurIdentifiant: { isError: false, message: '' },
      prixUnitaire: { isError: false, message: '' },
      quantite: { isError: false, message: '' },
      nomClient: { isError: false, message: '' },
      telephoneClient: { isError: false, message: '' },
      adressClient: { isError: false, message: '' },
      emailClient: { isError: false, message: '' },
    });
  }, [initialData]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'emailClient') {
      validateEmail(value as string);
    } else if (field === 'telephoneClient') {
      validatePhone(value as string);
    } else if (field === 'prixUnitaire') {
      validatePrice(value as number);
    } else if (field === 'quantite') {
      validateQuantity(value as number);
    } else if (
      ['utilisateurIdentifiant', 'fournisseurIdentifiant', 'nomClient', 'adressClient'].includes(
        field,
      )
    ) {
      validateRequiredField(field, value as string);
    }
  };

  const validateEmail = (email: string) => {
    const isValid = /^\S+@\S+\.\S+$/.test(email);
    setErrors((prev) => ({
      ...prev,
      emailClient: {
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
      telephoneClient: {
        isError: !isValid,
        message: isValid ? '' : 'Le numéro doit contenir au moins 8 chiffres',
      },
    }));
    return isValid;
  };

  const validatePrice = (price: number) => {
    const isValid = price > 0;
    setErrors((prev) => ({
      ...prev,
      prixUnitaire: {
        isError: !isValid,
        message: isValid ? '' : 'Le prix doit être supérieur à 0',
      },
    }));
    return isValid;
  };

  const validateQuantity = (quantity: number) => {
    const isValid = quantity > 0;
    setErrors((prev) => ({
      ...prev,
      quantite: {
        isError: !isValid,
        message: isValid ? '' : 'La quantité doit être supérieure à 0',
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

  const calculateTotal = () => {
    const subtotal = formData.prixUnitaire * formData.quantite;
    return subtotal + subtotal * (formData.tva / 100);
  };

  const validateForm = () => {
    const validations = [
      validateRequiredField('utilisateurIdentifiant', formData.utilisateurIdentifiant),
      validateRequiredField('fournisseurIdentifiant', formData.fournisseurIdentifiant),
      validatePrice(formData.prixUnitaire),
      validateQuantity(formData.quantite),
      validateRequiredField('nomClient', formData.nomClient),
      validatePhone(formData.telephoneClient),
      validateRequiredField('adressClient', formData.adressClient),
      validateEmail(formData.emailClient),
    ];

    return validations.every((v) => v);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const { statut, ...data } = formData;
    onSubmit({
      ...(initialData && { statut }),
      ...data,
    });
    onClose();
  };

  const isFormValid = () => {
    return (
      formData.utilisateurIdentifiant.trim() !== '' &&
      formData.fournisseurIdentifiant.trim() !== '' &&
      formData.prixUnitaire > 0 &&
      formData.quantite > 0 &&
      formData.nomClient.trim() !== '' &&
      /^[\d\s+-]{8,}$/.test(formData.telephoneClient) &&
      formData.adressClient.trim() !== '' &&
      /^\S+@\S+\.\S+$/.test(formData.emailClient)
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {initialData ? 'Modifier Commande' : 'Nouvelle Commande'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {initialData && (
          <SectionBox>
            <SectionHeader>Statut de la Commande</SectionHeader>
            <FormFieldContainer>
              <FieldLabel>Statut </FieldLabel>
              <TextField
                select
                fullWidth
                size="small"
                value={formData.statut}
                disabled={true}
                InputProps={{
                  readOnly: true,
                  sx: {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#000000',
                      opacity: 0.7,
                    },
                  },
                }}
              >
                <MenuItem value="en préparation">En préparation</MenuItem>
                <MenuItem value="en transit">En transit</MenuItem>
                <MenuItem value="livré">Livré</MenuItem>
              </TextField>
            </FormFieldContainer>
          </SectionBox>
        )}

        <SectionBox>
          <SectionHeader>Informations Principales</SectionHeader>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <FormFieldContainer>
                <FieldLabel>Livreur *</FieldLabel>
                <CompactSelect
                  select
                  fullWidth
                  size="small"
                  value={formData.utilisateurIdentifiant}
                  onChange={(e) => handleChange('utilisateurIdentifiant', e.target.value)}
                  error={errors.utilisateurIdentifiant.isError}
                  helperText={errors.utilisateurIdentifiant.message}
                >
                  {utilisateurs.map((u) => (
                    <MenuItem key={u.id} value={u.identifiant}>
                      {u.identifiant}
                    </MenuItem>
                  ))}
                </CompactSelect>
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormFieldContainer>
                <FieldLabel>Fournisseur *</FieldLabel>
                <CompactSelect
                  select
                  fullWidth
                  size="small"
                  value={formData.fournisseurIdentifiant}
                  onChange={(e) => handleChange('fournisseurIdentifiant', e.target.value)}
                  error={errors.fournisseurIdentifiant.isError}
                  helperText={errors.fournisseurIdentifiant.message}
                >
                  {fournisseurs.map((f) => (
                    <MenuItem key={f.id} value={f.identifiant}>
                      {f.identifiant}
                    </MenuItem>
                  ))}
                </CompactSelect>
              </FormFieldContainer>
            </Grid>

            <Grid item xs={12}>
              <FormFieldContainer>
                <FieldLabel>Description</FieldLabel>
                <CompactTextField
                  fullWidth
                  size="small"
                  multiline
                  rows={1}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </FormFieldContainer>
            </Grid>
          </Grid>
        </SectionBox>

        <SectionBox>
          <SectionHeader>Détails Commande</SectionHeader>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={4}>
              <FormFieldContainer>
                <FieldLabel>Prix Unitaire *</FieldLabel>
                <CompactTextField
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">DT</InputAdornment>,
                  }}
                  value={formData.prixUnitaire}
                  onChange={(e) => handleChange('prixUnitaire', Number(e.target.value))}
                  error={errors.prixUnitaire.isError}
                  helperText={errors.prixUnitaire.message}
                />
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormFieldContainer>
                <FieldLabel>Quantité *</FieldLabel>
                <CompactTextField
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.quantite}
                  onChange={(e) => handleChange('quantite', Number(e.target.value))}
                  error={errors.quantite.isError}
                  helperText={errors.quantite.message}
                />
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormFieldContainer>
                <FieldLabel>TVA (%)</FieldLabel>
                <CompactTextField
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.tva}
                  onChange={(e) => handleChange('tva', Number(e.target.value))}
                />
              </FormFieldContainer>
            </Grid>
          </Grid>

          <TotalDisplay>
            <Typography variant="body1" component="span">
              Total: {calculateTotal().toFixed(2)} DT
            </Typography>
          </TotalDisplay>
        </SectionBox>

        <Divider sx={{ my: 2, borderWidth: '1px' }} />

        <SectionBox>
          <SectionHeader>Coordonnées Client</SectionHeader>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <FormFieldContainer>
                <FieldLabel>Nom Client *</FieldLabel>
                <CompactTextField
                  fullWidth
                  size="small"
                  value={formData.nomClient}
                  onChange={(e) => handleChange('nomClient', e.target.value)}
                  error={errors.nomClient.isError}
                  helperText={errors.nomClient.message}
                />
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormFieldContainer>
                <FieldLabel>Email Client *</FieldLabel>
                <CompactTextField
                  fullWidth
                  size="small"
                  value={formData.emailClient}
                  onChange={(e) => handleChange('emailClient', e.target.value)}
                  error={errors.emailClient.isError}
                  helperText={errors.emailClient.message}
                />
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormFieldContainer>
                <FieldLabel>Téléphone *</FieldLabel>
                <CompactTextField
                  fullWidth
                  size="small"
                  value={formData.telephoneClient}
                  onChange={(e) => handleChange('telephoneClient', e.target.value)}
                  error={errors.telephoneClient.isError}
                  helperText={errors.telephoneClient.message}
                />
              </FormFieldContainer>
            </Grid>
            <Grid item xs={12}>
              <FormFieldContainer>
                <FieldLabel>Adresse *</FieldLabel>
                <CompactTextField
                  fullWidth
                  size="small"
                  multiline
                  rows={1}
                  value={formData.adressClient}
                  onChange={(e) => handleChange('adressClient', e.target.value)}
                  error={errors.adressClient.isError}
                  helperText={errors.adressClient.message}
                />
              </FormFieldContainer>
            </Grid>
          </Grid>
        </SectionBox>
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
          {initialData ? 'Mettre à Jour' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CommandeForm;
