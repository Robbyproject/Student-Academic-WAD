const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export async function studentRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error('VITE_API_URL belum dikonfigurasi.');
  }
  if (!token) {
    throw new Error('Token login tidak tersedia. Silakan keluar lalu login kembali.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const body =
      payload && typeof payload === 'object'
        ? (payload as Record<string, unknown>)
        : {};
    const errors =
      body.errors && typeof body.errors === 'object'
        ? (body.errors as Record<string, unknown>)
        : {};
    const firstError = Object.values(errors).flatMap((value) =>
      Array.isArray(value) ? value : [value]
    )[0];
    const message =
      typeof body.message === 'string'
        ? body.message
        : typeof firstError === 'string'
          ? firstError
          : `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }

  return payload as T;
}

export function unwrapRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const data = record.data;
  return data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : record;
}

export function unwrapList<T>(value: unknown, ...keys: string[]): T[] {
  let current = value;
  for (let depth = 0; depth < 4; depth += 1) {
    if (Array.isArray(current)) return current as T[];
    if (!current || typeof current !== 'object') return [];
    const record = current as Record<string, unknown>;
    const match = keys.find((key) => Array.isArray(record[key]));
    if (match) return record[match] as T[];
    current = record.data;
  }
  return [];
}
