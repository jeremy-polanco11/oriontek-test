import { Outlet, useLocation } from 'react-router-dom';
import { InputAdornment, TextField, IconButton, Tooltip, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Sidebar } from './Sidebar';

/**
 * Two-column app shell: sticky navy sidebar + main column with sticky topbar.
 * Mirrors the OrionTek design system's `.app-shell` layout.
 */
export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[248px_1fr] min-h-screen bg-surface-bg">
      <Sidebar />
      <div className="flex flex-col min-w-0">
        <TopBar pathname={pathname} />
        <main className="flex-1">
          <Box
            sx={{
              maxWidth: 1400,
              width: '100%',
              mx: 'auto',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
            }}
          >
            <Outlet />
          </Box>
        </main>
      </div>
    </div>
  );
}

function TopBar({ pathname: _pathname }: { pathname: string }) {
  return (
    <header
      className="sticky top-0 z-10 h-16 bg-white border-b border-line flex items-center gap-4 px-6 md:px-8"
    >
      <TextField
        size="small"
        placeholder="Buscar clientes, direcciones, RNC..."
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
            height: 38,
          },
        }}
      />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Tooltip title="Notificaciones">
          <IconButton
            aria-label="Notificaciones"
            sx={{
              border: '1px solid var(--ot-border)',
              backgroundColor: 'var(--ot-surface)',
              borderRadius: 2,
              width: 36,
              height: 36,
            }}
          >
            <NotificationsNoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ayuda">
          <IconButton
            aria-label="Ayuda"
            sx={{
              border: '1px solid var(--ot-border)',
              backgroundColor: 'var(--ot-surface)',
              borderRadius: 2,
              width: 36,
              height: 36,
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
}
