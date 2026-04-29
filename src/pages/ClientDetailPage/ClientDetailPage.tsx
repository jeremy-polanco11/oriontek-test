import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectClientById,
  selectClientsDetailStatus,
  selectClientsError,
  selectClientsMutationStatus,
} from '@/features/clients/clientsSelectors';
import {
  addAddress,
  deleteClient,
  fetchClientById,
  removeAddress,
  updateAddress,
  updateClient,
} from '@/features/clients/clientsThunks';
import type { Address } from '@/features/clients/types';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { AddressFormDialog } from '@/components/clients/AddressFormDialog';
import { AddressList } from '@/components/clients/AddressList';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

type Dialog =
  | { kind: 'closed' }
  | { kind: 'editClient' }
  | { kind: 'deleteClient' }
  | { kind: 'addAddress' }
  | { kind: 'editAddress'; address: Address }
  | { kind: 'deleteAddress'; address: Address };

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const detailStatus = useAppSelector(selectClientsDetailStatus);
  const mutationStatus = useAppSelector(selectClientsMutationStatus);
  const error = useAppSelector(selectClientsError);

  const clientSelector = useMemo(() => selectClientById(id), [id]);
  const client = useAppSelector(clientSelector);

  const [dialog, setDialog] = useState<Dialog>({ kind: 'closed' });

  useEffect(() => {
    if (id) void dispatch(fetchClientById(id));
  }, [id, dispatch]);

  const isMutating = mutationStatus === 'loading';
  const isLoading = detailStatus === 'loading' && !client;

  const handleUpdateClient = async (values: { name: string; email: string; phone: string }) => {
    if (!id) return;
    const res = await dispatch(updateClient({ id, changes: values }));
    if (updateClient.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  const handleDeleteClient = async () => {
    if (!id) return;
    const res = await dispatch(deleteClient(id));
    if (deleteClient.fulfilled.match(res)) navigate('/clients');
  };

  const handleAddAddress = async (input: ReturnType<typeof toAddressInput>) => {
    if (!id) return;
    const res = await dispatch(addAddress({ clientId: id, input }));
    if (addAddress.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  const handleUpdateAddress = async (
    addressId: string,
    input: ReturnType<typeof toAddressInput>,
  ) => {
    if (!id) return;
    const res = await dispatch(updateAddress({ clientId: id, addressId, input }));
    if (updateAddress.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  const handleRemoveAddress = async (addressId: string) => {
    if (!id) return;
    const res = await dispatch(removeAddress({ clientId: id, addressId }));
    if (removeAddress.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center py-16">
        <CircularProgress />
      </Box>
    );
  }

  if (!client && detailStatus === 'failed') {
    return (
      <Alert
        severity="error"
        action={
          <Button component={RouterLink} to="/clients" color="inherit" size="small">
            Volver al listado
          </Button>
        }
      >
        {error ?? 'Cliente no encontrado.'}
      </Alert>
    );
  }

  if (!client) return null;

  const initials = client.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Stack spacing={3.5}>
      {/* Breadcrumbs */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ fontSize: 13, color: 'text.secondary' }}>
        <RouterLink to="/clients" className="no-underline" style={{ color: 'var(--ot-fg-3)' }}>
          Clientes
        </RouterLink>
        <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
        <Typography variant="body2" sx={{ color: 'var(--ot-fg-1)' }}>
          {client.name}
        </Typography>
      </Stack>

      {/* Page header */}
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid var(--ot-border)',
          borderRadius: 1.5,
          boxShadow: 'var(--ot-shadow-xs)',
          p: 3,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ sm: 'flex-start' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--ot-gradient)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 22,
                boxShadow: 'var(--ot-shadow-brand)',
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box>
              <Typography variant="h1">{client.name}</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'var(--ot-font-mono)', color: 'text.secondary', mt: 0.5 }}>
                ID-{client.id.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => setDialog({ kind: 'editClient' })}
            >
              Editar
            </Button>
            <IconButton
              aria-label="Eliminar cliente"
              onClick={() => setDialog({ kind: 'deleteClient' })}
              sx={{
                border: '1px solid var(--ot-border-strong)',
                borderRadius: 2,
                width: 38,
                height: 38,
                color: 'var(--ot-danger)',
                '&:hover': {
                  backgroundColor: 'var(--ot-danger-bg)',
                  borderColor: 'var(--ot-danger)',
                  color: 'var(--ot-danger)',
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Two-column layout: details (left) + addresses (right wider) */}
      <Box
        className="grid gap-6"
        sx={{
          gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' },
        }}
      >
        {/* Left: contact info */}
        <Box
          sx={{
            backgroundColor: '#fff',
            border: '1px solid var(--ot-border)',
            borderRadius: 1.5,
            boxShadow: 'var(--ot-shadow-xs)',
            p: 2.5,
            height: 'fit-content',
          }}
        >
          <Typography className="ot-eyebrow" component="div" sx={{ mb: 2 }}>
            Información de contacto
          </Typography>
          <Box
            component="dl"
            sx={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              gap: '12px 16px',
              m: 0,
              fontSize: 14,
              '& dt': { color: 'text.secondary', m: 0 },
              '& dd': { color: 'var(--ot-fg-1)', m: 0, fontWeight: 500, wordBreak: 'break-word' },
            }}
          >
            <Box component="dt">Correo</Box>
            <Box component="dd">
              <a href={`mailto:${client.email}`} style={{ color: 'var(--ot-primary-600)', textDecoration: 'none' }}>
                {client.email}
              </a>
            </Box>
            <Box component="dt">Teléfono</Box>
            <Box component="dd" sx={{ fontFamily: 'var(--ot-font-mono)' }}>
              {client.phone}
            </Box>
            <Box component="dt">Registrado</Box>
            <Box component="dd" sx={{ fontFamily: 'var(--ot-font-mono)' }}>
              {new Date(client.createdAt).toISOString().slice(0, 10)}
            </Box>
            <Box component="dt">Direcciones</Box>
            <Box component="dd">
              <Chip size="small" label={client.addresses.length} color="primary" sx={{ minWidth: 32 }} />
            </Box>
          </Box>
        </Box>

        {/* Right: addresses */}
        <Box
          sx={{
            backgroundColor: '#fff',
            border: '1px solid var(--ot-border)',
            borderRadius: 1.5,
            boxShadow: 'var(--ot-shadow-xs)',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2.25,
              borderBottom: '1px solid var(--ot-border)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h3" sx={{ fontSize: 17 }}>
                Direcciones registradas
              </Typography>
              <Chip
                size="small"
                label={client.addresses.length}
                color={client.addresses.length > 0 ? 'primary' : 'default'}
                sx={{ minWidth: 28 }}
              />
            </Stack>
            <Button
              startIcon={<AddLocationAltIcon />}
              variant="contained"
              size="small"
              onClick={() => setDialog({ kind: 'addAddress' })}
            >
              Nueva dirección
            </Button>
          </Stack>
          <Box sx={{ p: 2.5 }}>
            <AddressList
              addresses={client.addresses}
              onEdit={(a) => setDialog({ kind: 'editAddress', address: a })}
              onDelete={(a) => setDialog({ kind: 'deleteAddress', address: a })}
            />
          </Box>
        </Box>
      </Box>

      {/* Dialogs */}
      <ClientFormDialog
        open={dialog.kind === 'editClient'}
        initial={client}
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onSubmit={handleUpdateClient}
      />

      <ConfirmDialog
        open={dialog.kind === 'deleteClient'}
        title="Eliminar cliente"
        description={`¿Eliminar a "${client.name}" y todas sus direcciones? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onConfirm={handleDeleteClient}
      />

      <AddressFormDialog
        open={dialog.kind === 'addAddress'}
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onSubmit={(values) => void handleAddAddress(toAddressInput(values))}
      />

      <AddressFormDialog
        open={dialog.kind === 'editAddress'}
        initial={dialog.kind === 'editAddress' ? dialog.address : undefined}
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onSubmit={(values) => {
          if (dialog.kind === 'editAddress') {
            void handleUpdateAddress(dialog.address.id, toAddressInput(values));
          }
        }}
      />

      <ConfirmDialog
        open={dialog.kind === 'deleteAddress'}
        title="Eliminar dirección"
        description={
          dialog.kind === 'deleteAddress'
            ? `¿Eliminar la dirección en "${dialog.address.street}, ${dialog.address.city}"?`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onConfirm={() => {
          if (dialog.kind === 'deleteAddress') {
            void handleRemoveAddress(dialog.address.id);
          }
        }}
      />
    </Stack>
  );
}

function toAddressInput(v: {
  label?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}) {
  return {
    label: v.label?.trim() ? v.label.trim() : undefined,
    street: v.street,
    city: v.city,
    state: v.state,
    country: v.country,
    zipCode: v.zipCode,
  };
}
