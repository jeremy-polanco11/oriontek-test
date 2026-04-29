import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormValues } from '@/utils/validators';
import type { Address } from '@/features/clients/types';

interface AddressFormDialogProps {
  open: boolean;
  initial?: Address;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (values: AddressFormValues) => void;
}

const emptyValues: AddressFormValues = {
  label: '',
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
};

export function AddressFormDialog({
  open,
  initial,
  loading = false,
  onCancel,
  onSubmit,
}: AddressFormDialogProps) {
  const isEdit = Boolean(initial);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onChange',
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              label: initial.label ?? '',
              street: initial.street,
              city: initial.city,
              state: initial.state,
              country: initial.country,
              zipCode: initial.zipCode,
            }
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
      aria-labelledby="address-form-title"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle id="address-form-title">
          {isEdit ? 'Editar dirección' : 'Nueva dirección'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Etiqueta (opcional)"
                fullWidth
                placeholder="Ej. Oficina Principal"
                autoFocus
                {...register('label')}
                error={Boolean(errors.label)}
                helperText={errors.label?.message ?? ' '}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Calle"
                fullWidth
                {...register('street')}
                error={Boolean(errors.street)}
                helperText={errors.street?.message ?? ' '}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ciudad"
                fullWidth
                {...register('city')}
                error={Boolean(errors.city)}
                helperText={errors.city?.message ?? ' '}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provincia / Estado"
                fullWidth
                {...register('state')}
                error={Boolean(errors.state)}
                helperText={errors.state?.message ?? ' '}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="País"
                fullWidth
                {...register('country')}
                error={Boolean(errors.country)}
                helperText={errors.country?.message ?? ' '}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código postal"
                fullWidth
                {...register('zipCode')}
                error={Boolean(errors.zipCode)}
                helperText={errors.zipCode?.message ?? ' '}
              />
            </Grid>
          </Grid>
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
            {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar dirección'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
