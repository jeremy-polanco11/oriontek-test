import { Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Paper
      variant="outlined"
      className="!p-12 !text-center max-w-lg !mx-auto !mt-12"
    >
      <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
        404
      </Typography>
      <Typography variant="h2" sx={{ fontSize: '1.25rem', mb: 2 }}>
        Página no encontrada
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        La página que busca no existe o fue movida.
      </Typography>
      <Button component={Link} to="/clients" variant="contained">
        Ir a Clientes
      </Button>
    </Paper>
  );
}
