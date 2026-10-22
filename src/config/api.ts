/**
 * API base URLs for the stocks-analyzer backends.
 * By default: Insider=8000, Screening=8001, Financials=8002, Valuation=8003.
 * In dev, empty base is used so Vite proxy can forward /api/screening, /api/insider, /api/financials, /api/valuation.
 * Override in .env: VITE_INSIDER_API_URL, VITE_SCREENING_API_URL, VITE_FINANCIALS_API_URL, VITE_VALUATION_API_URL
 * Or set VITE_API_BASE to use the same origin for all.
 */
const base = import.meta.env.VITE_API_BASE as string | undefined
const devBase = import.meta.env.DEV && base === undefined ? '' : undefined
const effectiveBase = base ?? devBase

export const API = {
  insider: (import.meta.env.VITE_INSIDER_API_URL ?? effectiveBase ?? 'http://localhost:8000').replace(/\/$/, ''),
  screening: (import.meta.env.VITE_SCREENING_API_URL ?? effectiveBase ?? 'http://localhost:8001').replace(/\/$/, ''),
  financials: (import.meta.env.VITE_FINANCIALS_API_URL ?? effectiveBase ?? 'http://localhost:8002').replace(/\/$/, ''),
  valuation: (import.meta.env.VITE_VALUATION_API_URL ?? effectiveBase ?? 'http://localhost:8003').replace(/\/$/, ''),
} as const

export function getInsiderUrl(path: string): string {
  return `${API.insider.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function getScreeningUrl(path: string): string {
  return `${API.screening.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function getFinancialsUrl(path: string): string {
  return `${API.financials.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function getValuationUrl(path: string): string {
  return `${API.valuation.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
