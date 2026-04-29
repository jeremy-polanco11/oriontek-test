import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AppLayout } from '@/components/layout/AppLayout';

// Route-level code splitting — keeps initial bundle smaller. Each page becomes
// its own chunk that Webpack downloads on first navigation.
const ClientsPage = lazy(() =>
  import('@/pages/ClientsPage').then((m) => ({ default: m.ClientsPage })),
);
const ClientDetailPage = lazy(() =>
  import('@/pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const RouteFallback = () => (
  <Box className="flex items-center justify-center py-16">
    <CircularProgress />
  </Box>
);
  
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/clients" replace />} />
        <Route
          path="clients"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ClientsPage />
            </Suspense>
          }
        />
        <Route
          path="clients/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ClientDetailPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
