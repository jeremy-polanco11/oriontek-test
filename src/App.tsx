import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './app/store';
import { theme } from './styles/theme';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline must come BEFORE Tailwind directives in load order:
            it sets up MUI's reset, and Tailwind preflight is disabled to avoid
            clashing with MUI typography. */}
        <CssBaseline />
        <BrowserRouter
          future={{
            // Opt into React Router v7 behavior early — silences upgrade warnings
            // and ensures we're testing against the future state-update model.
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
