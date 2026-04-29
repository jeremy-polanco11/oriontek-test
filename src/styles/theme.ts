import { createTheme, alpha } from '@mui/material/styles';

/**
 * OrionTek brand theme.
 * Tokens mirror the design system's colors_and_type.css. Values are duplicated
 * in JS (instead of read from CSS vars) so MUI's `sx` prop and JS color helpers
 * (alpha, lighten, etc.) work without quirks.
 */
const palette = {
  primary: {
    50: '#eef6fd',
    100: '#d6eafa',
    200: '#add4f4',
    300: '#7bb8ec',
    400: '#4099dc',
    500: '#0898d8',
    600: '#0a7bb4',
    700: '#0c6293',
    800: '#0e4f76',
    900: '#103e5c',
  },
  brand: {
    purple: '#6868b8',
    blue: '#0898d8',
    gradient: 'linear-gradient(120deg, #6868b8 0%, #2888c8 55%, #0898d8 100%)',
    gradientSoft: 'linear-gradient(120deg, #eeeefb 0%, #e2f2fc 100%)',
  },
  fg: {
    1: '#0f1b2d',
    2: '#2a3a52',
    3: '#5a6a82',
    4: '#8a98ad',
  },
  surface: {
    bg: '#f7f9fc',
    surface: '#ffffff',
    surface2: '#f2f5fa',
    surface3: '#e8edf5',
  },
  border: {
    DEFAULT: '#e1e6ef',
    strong: '#c9d2df',
    divider: '#edf1f7',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.primary[500],
      light: palette.primary[400],
      dark: palette.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: palette.brand.purple,
    },
    background: {
      default: palette.surface.bg,
      paper: palette.surface.surface,
    },
    text: {
      primary: palette.fg[1],
      secondary: palette.fg[3],
      disabled: palette.fg[4],
    },
    divider: palette.border.DEFAULT,
    error: {
      main: '#c73b3b',
      light: '#fbe6e6',
    },
    success: {
      main: '#1f9d6f',
      light: '#e4f6ee',
    },
    warning: {
      main: '#c97b0f',
      light: '#fcf1dc',
    },
    info: {
      main: palette.primary[500],
      light: '#e0f1fb',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    fontSize: 14,
    h1: {
      fontSize: '30px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: palette.fg[1],
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.35,
      color: palette.fg[1],
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.35,
      color: palette.fg[1],
    },
    h4: {
      fontSize: '17px',
      fontWeight: 600,
      lineHeight: 1.35,
      color: palette.fg[1],
    },
    body1: { fontSize: '14px', color: palette.fg[2] },
    body2: { fontSize: '13px', color: palette.fg[3] },
    caption: { fontSize: '12px', color: palette.fg[3], letterSpacing: '0.02em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.005em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.surface.bg,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 38,
          padding: '0 16px',
          fontWeight: 600,
          transition: 'all 120ms ease',
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(8, 152, 216, 0.18)',
          },
        },
        sizeSmall: { height: 32, padding: '0 12px', fontSize: 13 },
        sizeLarge: { height: 44, padding: '0 20px', fontSize: 15 },
        containedPrimary: {
          background: palette.brand.gradient,
          color: '#fff',
          boxShadow: '0 8px 24px rgba(40, 136, 200, 0.25)',
          '&:hover': {
            background: palette.brand.gradient,
            filter: 'brightness(1.06)',
            transform: 'translateY(-1px)',
            boxShadow: '0 12px 28px rgba(40, 136, 200, 0.32)',
          },
          '&:active': {
            transform: 'translateY(0)',
            filter: 'brightness(0.96)',
          },
        },
        outlinedPrimary: {
          borderColor: palette.border.strong,
          color: palette.fg[1],
          background: palette.surface.surface,
          '&:hover': {
            background: palette.surface.surface2,
            borderColor: '#adb8ca',
          },
        },
        textPrimary: {
          color: palette.fg[2],
          '&:hover': {
            background: palette.surface.surface3,
            color: palette.fg[1],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: { borderRadius: 12 },
        outlined: {
          borderColor: palette.border.DEFAULT,
          boxShadow: '0 1px 2px rgba(15, 27, 45, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${palette.border.DEFAULT}`,
          boxShadow: '0 1px 2px rgba(15, 27, 45, 0.06)',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: palette.surface.surface,
          color: palette.fg[1],
          borderBottom: `1px solid ${palette.border.DEFAULT}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: palette.fg[3],
          backgroundColor: palette.surface.surface2,
          borderBottom: `1px solid ${palette.border.DEFAULT}`,
        },
        root: {
          padding: '14px 16px',
          borderBottom: `1px solid ${palette.border.divider}`,
          color: palette.fg[2],
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 100ms',
          '&:last-child td': { borderBottom: 'none' },
        },
        hover: {
          '&:hover': { backgroundColor: palette.surface.surface2 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: palette.surface.surface,
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.border.strong,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#98a4b8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary[500],
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(8, 152, 216, 0.18)',
          },
        },
        input: {
          padding: '10px 12px',
          fontSize: 14,
          color: palette.fg[1],
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 14,
          color: palette.fg[3],
          '&.Mui-focused': { color: palette.primary[600] },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(15, 27, 45, 0.10), 0 4px 8px rgba(15, 27, 45, 0.04)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 18,
          fontWeight: 700,
          color: palette.fg[1],
          padding: '20px 24px',
          borderBottom: `1px solid ${palette.border.DEFAULT}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px !important',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderTop: `1px solid ${palette.border.DEFAULT}`,
          backgroundColor: palette.surface.surface2,
          gap: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: 12,
          height: 24,
        },
        colorPrimary: {
          backgroundColor: '#e0f1fb',
          color: palette.primary[700],
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.fg[1],
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 10px',
          borderRadius: 6,
        },
        arrow: { color: palette.fg[1] },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: palette.fg[3],
          '&:hover': {
            backgroundColor: palette.surface.surface2,
            color: palette.fg[1],
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: 14,
        },
        standardError: {
          backgroundColor: '#fbe6e6',
          color: '#c73b3b',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: palette.fg[4],
            opacity: 1,
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: {
          color: palette.primary[500],
        },
      },
    },
  },
});

// Re-export raw tokens so non-MUI elements (Tailwind class composition, plain divs)
// can read brand values from one place.
export const brand = {
  gradient: palette.brand.gradient,
  gradientSoft: palette.brand.gradientSoft,
  navy: palette.fg[1],
  ringFocus: '0 0 0 3px rgba(8, 152, 216, 0.18)',
  shadow: {
    xs: '0 1px 2px rgba(15, 27, 45, 0.06)',
    sm: '0 1px 3px rgba(15, 27, 45, 0.08), 0 1px 2px rgba(15, 27, 45, 0.04)',
    md: '0 4px 12px rgba(15, 27, 45, 0.08), 0 2px 4px rgba(15, 27, 45, 0.04)',
    brand: '0 8px 24px rgba(40, 136, 200, 0.25)',
  },
  alpha,
};
