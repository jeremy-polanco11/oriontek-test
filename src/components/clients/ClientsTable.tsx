import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link as RouterLink } from 'react-router-dom';
import type { Client } from '@/features/clients/types';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid var(--ot-border)',
          borderRadius: 1.5,
          p: 8,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontSize: 17, mb: 0.5 }}>
          Sin clientes registrados
        </Typography>
        <Typography color="text.secondary">
          Agregue su primer cliente para comenzar.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      sx={{
        backgroundColor: '#fff',
        border: '1px solid var(--ot-border)',
        borderRadius: 1.5,
        boxShadow: 'var(--ot-shadow-xs)',
      }}
    >
      <Table aria-label="Tabla de clientes">
        <TableHead>
          <TableRow>
            <TableCell>Cliente</TableCell>
            <TableCell>Contacto</TableCell>
            <TableCell align="center">Direcciones</TableCell>
            <TableCell>Registrado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'var(--ot-gradient)',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {initials(c.name)}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <RouterLink
                      to={`/clients/${c.id}`}
                      className="font-semibold no-underline"
                      style={{ color: 'var(--ot-fg-1)' }}
                    >
                      {c.name}
                    </RouterLink>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: 'text.secondary', fontFamily: 'var(--ot-font-mono)' }}
                    >
                      ID-{c.id.slice(0, 8).toUpperCase()}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Box>
                  <a
                    href={`mailto:${c.email}`}
                    className="no-underline"
                    style={{ color: 'var(--ot-fg-2)', display: 'block', fontWeight: 500 }}
                  >
                    {c.email}
                  </a>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontFamily: 'var(--ot-font-mono)' }}
                  >
                    {c.phone}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={c.addresses.length}
                  color={c.addresses.length > 0 ? 'primary' : 'default'}
                  variant={c.addresses.length > 0 ? 'filled' : 'outlined'}
                  sx={{ minWidth: 32 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'var(--ot-font-mono)', color: 'text.secondary' }}>
                  {new Date(c.createdAt).toISOString().slice(0, 10)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Ver detalle">
                    <IconButton
                      component={RouterLink}
                      to={`/clients/${c.id}`}
                      size="small"
                      aria-label={`Ver ${c.name}`}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onEdit(c)} size="small" aria-label={`Editar ${c.name}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      onClick={() => onDelete(c)}
                      size="small"
                      aria-label={`Eliminar ${c.name}`}
                      sx={{ '&:hover': { color: 'error.main' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
