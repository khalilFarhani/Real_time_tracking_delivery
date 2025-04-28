import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  Typography,
  Box,
  styled,
} from '@mui/material';
import sitemap from 'routes/sitemap';
import axios from 'axios';

interface PermissionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (permission: { permissionName: string; description: string }) => void;
  initialData?: {
    id?: number;
    permissionName: string;
    description: string;
  };
}

const API_URL = 'http://localhost:5283';

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

const CompactSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '0.875rem',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor:
      theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.text.primary,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: '1px',
    borderColor: theme.palette.primary.main,
  },
}));

const FormFieldContainer = styled(Box)({
  marginBottom: '24px',
});

const FieldLabel = styled(Typography)({
  marginBottom: '8px',
  fontWeight: 500,
  fontSize: '0.8rem',
});

const PermissionForm: React.FC<PermissionFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [permissionName, setPermissionName] = useState(initialData?.permissionName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [existingPermissions, setExistingPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ isError: false, message: '' });

  useEffect(() => {
    const fetchExistingPermissions = async () => {
      try {
        const response = await axios.get<{ permissionName: string }[]>(
          `${API_URL}/api/permissions/liste`,
        );
        setExistingPermissions(response.data.map((p) => p.permissionName));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
        setError({ isError: true, message: 'Erreur lors du chargement des permissions' });
      }
    };

    if (open) {
      fetchExistingPermissions();
    }
  }, [open]);

  const isPermissionUsed = (subheader: string) => {
    return existingPermissions.includes(subheader);
  };

  const allPermissionOptions = sitemap
    .filter(
      (item) => item.subheader && !['Utilisateur', 'Permission', 'Logout'].includes(item.subheader),
    )
    .map((item) => item.subheader)
    .filter((value, index, self) => self.indexOf(value) === index);

  const availablePermissionOptions = allPermissionOptions.filter(
    (subheader) => !isPermissionUsed(subheader),
  );

  const usedPermissionOptions = allPermissionOptions.filter((subheader) =>
    isPermissionUsed(subheader),
  );

  const noAvailablePermissions = availablePermissionOptions.length === 0;

  useEffect(() => {
    if (initialData) {
      setPermissionName(initialData.permissionName);
      setDescription(initialData.description);
    } else {
      setPermissionName('');
      setDescription('');
    }
    setError({ isError: false, message: '' });
  }, [initialData]);

  const handleSubmit = () => {
    if (!permissionName) {
      setError({ isError: true, message: 'Veuillez sélectionner une permission' });
      return;
    }

    onSubmit({ permissionName, description });
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {initialData ? 'Modifier Permission' : 'Nouvelle Permission'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Typography>Chargement des permissions...</Typography>
        ) : error.isError ? (
          <Typography color="error">{error.message}</Typography>
        ) : (
          <>
            <FormFieldContainer>
              <FieldLabel>Nom de Permission *</FieldLabel>
              <FormControl fullWidth>
                <CompactSelect
                  value={permissionName}
                  onChange={(e) => setPermissionName(e.target.value as string)}
                  disabled={!!initialData}
                  error={error.isError}
                >
                  {availablePermissionOptions.length > 0 ? (
                    availablePermissionOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      <em>Aucune nouvelle permission disponible</em>
                    </MenuItem>
                  )}

                  {noAvailablePermissions &&
                    usedPermissionOptions.map((option) => (
                      <MenuItem key={option} value={option} disabled>
                        {option} (déjà attribuée)
                      </MenuItem>
                    ))}
                </CompactSelect>
              </FormControl>
              {error.isError && (
                <Typography color="error" variant="caption">
                  {error.message}
                </Typography>
              )}
            </FormFieldContainer>

            <FormFieldContainer>
              <FieldLabel>Description</FieldLabel>
              <CompactTextField
                fullWidth
                multiline
                rows={1}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormFieldContainer>
          </>
        )}
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
          disabled={loading || noAvailablePermissions || !permissionName}
        >
          {initialData ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PermissionForm;
