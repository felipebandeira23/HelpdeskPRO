'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Wrapper de fetch para a API. `path` deve começar com `/` (ex: `/api/assets`).
 * Lança erro com a mensagem do backend quando a resposta não é ok.
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      /* corpo não-JSON */
    }
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T = any>(path: string) => apiFetch<T>(path),
  post: <T = any>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T = any>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: <T = any>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: <T = any>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
