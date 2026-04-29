import axios, { AxiosError } from 'axios';

/**
 * Axios instance used everywhere. The dev server proxies '/api' → json-server (port 3001).
 * In production this would point to a real API base URL via env var.
 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Common shape returned to the UI when something fails. */
export interface ApiErrorPayload {
  status: number | 'network' | 'unknown';
  message: string;
}

/** Normalizes any axios error so thunks can pass a consistent payload to UI. */
export function toApiError(err: unknown): ApiErrorPayload {
  if (err instanceof AxiosError) {
    if (err.response) {
      return {
        status: err.response.status,
        message:
          (err.response.data as { message?: string } | undefined)?.message ??
          err.message,
      };
    }
    if (err.request) {
      return { status: 'network', message: 'Network error — is json-server running on :3010?' };
    }
  }
  return {
    status: 'unknown',
    message: err instanceof Error ? err.message : 'Unknown error',
  };
}

// Response interceptor — pass through, but log network failures in dev.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (process.env.NODE_ENV !== 'production' && !err.response) {
      // eslint-disable-next-line no-console
      console.warn('[api] network error:', err.message);
    }
    return Promise.reject(err);
  },
);
