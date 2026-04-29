import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, type ClientFormValues } from '@/utils/validators';
import type { Client } from '@/features/clients/types';

interface ClientFormDialogProps {
  open: boolean;
  /** When provided, dialog operates in edit mode and pre-fills fields. */
  initial?: Client;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ClientFormValues) => void;
}

const emptyValues: ClientFormValues = { name: '', email: '', phone: '' };

export function ClientFormDialog({
  open,
  initial,
  loading = false,
  onCancel,
  onSubmit,
}: ClientFormDialogProps) {
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: emptyValues,
  });

  // Reset form whenever dialog opens — keeps create vs edit clean.
  useEffect(() => {
    if (open) {
      reset(
        initial
          ? { name: initial.name, email: initial.email, phone: initial.phone }
          : emptyValues,
      );
    }
  }, [open, initial, reset]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="client-form-title"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle id="client-form-title">
          {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              autoFocus
              fullWidth
              {...register('name')}
              error={Boolean(errors.name)}
              helperText={errors.name?.message ?? ' '}
            />
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message ?? ' '}
            />
            <TextField
              label="Teléfono"
              fullWidth
              {...register('phone')}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message ?? ' '}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isValid}
          >
            {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
