import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
} from '@mui/material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isForceDelete?: boolean;
  warningMessage?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isForceDelete = false,
  warningMessage,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
    >
      <DialogTitle id="confirm-delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          {message}
          {itemName && (
            <>
              {' '}
              <strong>{itemName}</strong>
            </>
          )}
          ?
          <br />
          {!isForceDelete && 'Cette action est irréversible.'}
        </DialogContentText>
        {isForceDelete && warningMessage && (
          <>
            <br />
            <Typography color="error" variant="body2">
              ⚠️ {warningMessage}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Annuler
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {isForceDelete ? 'Supprimer tout' : 'Supprimer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
