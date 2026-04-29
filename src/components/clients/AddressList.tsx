import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import type { Address } from '@/features/clients/types';

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
}

export function AddressList({ addresses, onEdit, onDelete }: AddressListProps) {
  if (addresses.length === 0) {
    return (
      <Box
        sx={{
          border: '1px dashed var(--ot-border-strong)',
          borderRadius: 1.5,
          p: 5,
          textAlign: 'center',
          backgroundColor: 'var(--ot-surface-2)',
        }}
      >
        <Typography variant="h4" sx={{ fontSize: 15, mb: 0.5 }}>
          Sin direcciones registradas
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Agregue una dirección para comenzar.
        </Typography>
      </Box>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {addresses.map((a, idx) => (
        <Box
          key={a.id}
          sx={{
            border: '1px solid var(--ot-border)',
            borderRadius: 1,
            backgroundColor: '#fff',
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            p: 1.75,
            transition: 'all 120ms',
            '&:hover': {
              borderColor: 'var(--ot-primary-300)',
              boxShadow: 'var(--ot-shadow-sm)',
            },
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              backgroundColor: 'var(--ot-primary-50)',
              color: 'var(--ot-primary-600)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <PlaceIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontWeight: 600, color: 'var(--ot-fg-1)', fontSize: 14 }}>
                {a.label || `Dirección ${idx + 1}`}
              </Typography>
              {idx === 0 && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--ot-primary-700)',
                    backgroundColor: 'var(--ot-info-bg)',
                    px: 1,
                    py: 0.25,
                    borderRadius: 999,
                  }}
                  aria-label="Dirección principal"
                >
                  <StarIcon sx={{ fontSize: 12 }} /> Principal
                </Box>
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: 'var(--ot-fg-2)', lineHeight: 1.5 }}>
              {a.street}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
              {a.city}, {a.state} {a.zipCode} · {a.country}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => onEdit(a)} aria-label="Editar dirección">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                onClick={() => onDelete(a)}
                aria-label="Eliminar dirección"
                sx={{ '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      ))}
    </div>
  );
}
