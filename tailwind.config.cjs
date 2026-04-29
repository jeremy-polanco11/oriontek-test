/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}', './public/index.html'],
  // Preflight off so MUI CssBaseline drives the reset.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        // Mirror the OrionTek tokens — useful for utility classes alongside MUI sx.
        brand: {
          purple: '#6868b8',
          blue: '#0898d8',
        },
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
        ink: {
          1: '#0f1b2d',
          2: '#2a3a52',
          3: '#5a6a82',
          4: '#8a98ad',
        },
        surface: {
          bg: '#f7f9fc',
          DEFAULT: '#ffffff',
          2: '#f2f5fa',
          3: '#e8edf5',
        },
        line: {
          DEFAULT: '#e1e6ef',
          strong: '#c9d2df',
          divider: '#edf1f7',
        },
        navy: '#0f1b2d',
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #6868b8 0%, #2888c8 55%, #0898d8 100%)',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15, 27, 45, 0.06)',
        sm: '0 1px 3px rgba(15, 27, 45, 0.08), 0 1px 2px rgba(15, 27, 45, 0.04)',
        md: '0 4px 12px rgba(15, 27, 45, 0.08), 0 2px 4px rgba(15, 27, 45, 0.04)',
        lg: '0 12px 32px rgba(15, 27, 45, 0.10), 0 4px 8px rgba(15, 27, 45, 0.04)',
        brand: '0 8px 24px rgba(40, 136, 200, 0.25)',
      },
    },
  },
  plugins: [],
};
