import { createTheme } from '@mantine/core'

/**
 * Palette #1: Deep navy & teal
 * Primary: #0f766e (teal), Background: #0f172a (navy), Surface: #1e293b
 * Accent: #2dd4bf, Muted: #94a3b8, Negative: #f87171
 */
export const theme = createTheme({
  primaryColor: 'teal',
  primaryShade: { light: 5, dark: 5 },

  colors: {
    teal: [
      '#ccfbf1',
      '#99f6e4',
      '#5eead4',
      '#2dd4bf', // accent / links
      '#14b8a6',
      '#0f766e', // primary
      '#0d9488',
      '#115e59',
      '#134e4a',
      '#042f2e',
    ],
    dark: [
      '#f8fafc',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8', // muted text
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b', // surface / cards
      '#0f172a', // background
      '#020617',
    ],
    green: [
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#22c55e',
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
      '#052e16',
    ],
    red: [
      '#fee2e2',
      '#fecaca',
      '#fca5a5',
      '#f87171', // negative / sells
      '#ef4444',
      '#dc2626',
      '#b91c1c',
      '#991b1b',
      '#7f1d1d',
      '#450a0a',
    ],
  },

  defaultRadius: 'md',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
})
