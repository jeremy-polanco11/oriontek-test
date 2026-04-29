import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectClientsError,
  selectClientsMutationStatus,
  selectClientsStatus,
  selectFilteredClients,
} from '@/features/clients/clientsSelectors';
import {
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from '@/features/clients/clientsThunks';
import type { Client } from '@/features/clients/types';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

type DialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; client: Client }
  | { kind: 'delete'; client: Client };

export function ClientsPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectClientsStatus);
  const mutationStatus = useAppSelector(selectClientsMutationStatus);
  const error = useAppSelector(selectClientsError);

  const [search, setSearch] = useState('');
  const filteredSelector = useMemo(() => selectFilteredClients(search), [search]);
  const clients = useAppSelector(filteredSelector);

  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchClients());
  }, [status, dispatch]);

  const isMutating = mutationStatus === 'loading';
  const isLoading = status === 'loading';

  const handleCreate = async (values: { name: string; email: string; phone: string }) => {
    const res = await dispatch(createClient(values));
    if (createClient.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  const handleUpdate = async (
    id: string,
    values: { name: string; email: string; phone: string },
  ) => {
    const res = await dispatch(updateClient({ id, changes: values }));
    if (updateClient.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  const handleDelete = async (id: string) => {
    const res = await dispatch(deleteClient(id));
    if (deleteClient.fulfilled.match(res)) setDialog({ kind: 'closed' });
  };

  return (
    <Stack spacing={3.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        alignItems={{ sm: 'flex-start' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography className="ot-eyebrow" component="div" sx={{ mb: 0.5 }}>
            Cartera de clientes
          </Typography>
          <Typography variant="h1">Clientes</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Gestione la cartera completa de OrionTek y sus direcciones registradas.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setDialog({ kind: 'create' })}
        >
          Nuevo cliente
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{
          p: 2,
          backgroundColor: '#fff',
          border: '1px solid var(--ot-border)',
          borderRadius: 1.5,
        }}
      >
        <TextField
          placeholder="Buscar por nombre, correo o teléfono..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            maxWidth: 480,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'var(--ot-surface-2)',
            },
          }}
        />
        <Box className="flex-1" />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {clients.length} resultado{clients.length === 1 ? '' : 's'}
        </Typography>
      </Stack>

      {error && status !== 'loading' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => dispatch(fetchClients())}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box className="flex items-center justify-center py-16">
          <CircularProgress />
        </Box>
      ) : (
        <ClientsTable
          clients={clients}
          onEdit={(c) => setDialog({ kind: 'edit', client: c })}
          onDelete={(c) => setDialog({ kind: 'delete', client: c })}
        />
      )}

      <ClientFormDialog
        open={dialog.kind === 'create'}
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onSubmit={handleCreate}
      />

      <ClientFormDialog
        open={dialog.kind === 'edit'}
        initial={dialog.kind === 'edit' ? dialog.client : undefined}
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onSubmit={(values) => {
          if (dialog.kind === 'edit') void handleUpdate(dialog.client.id, values);
        }}
      />

      <ConfirmDialog
        open={dialog.kind === 'delete'}
        title="Eliminar cliente"
        description={
          dialog.kind === 'delete'
            ? `¿Eliminar a "${dialog.client.name}" y todas sus direcciones? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        loading={isMutating}
        onCancel={() => setDialog({ kind: 'closed' })}
        onConfirm={() => {
          if (dialog.kind === 'delete') void handleDelete(dialog.client.id);
        }}
      />
    </Stack>
  );
}
