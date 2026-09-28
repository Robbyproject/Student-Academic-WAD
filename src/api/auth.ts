import type { UserProfile } from '../types/user';

export type UserRole = 'mahasiswa' | 'dosen' | 'admin';

export type AuthSession = {
  token: string | null;
  role: UserRole;
  user: UserProfile;
};

type LoginCredentials = {
  email: string;
  password: string;
};

const apiUrl = import.meta.env.VITE_API_URL || '';

function endpoint(configuredEndpoint: string | undefined, fallback: string) {
  const path = configuredEndpoint || fallback;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${apiUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function text(...values: unknown[]): string {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return typeof value === 'string' ? value : '';
}

function normalizeRole(value: unknown): UserRole {
  const record = asRecord(value);
  const role = String(record.name ?? record.slug ?? record.nama ?? value ?? '')
    .toLowerCase()
    .trim();

  if (['mahasiswa', 'student', 'students'].includes(role)) return 'mahasiswa';
  if (['dosen', 'lecturer', 'teacher'].includes(role)) return 'dosen';
  if (['admin', 'staff', 'staf', 'administrator', 'admin/staff', 'staff kampus'].includes(role)) return 'admin';

  throw new Error('Role akun tidak dikenali. Hubungi administrator kampus.');
}

function getErrorMessage(body: Record<string, unknown>, status: number) {
  const message = body.message;
  if (typeof message === 'string') return message;

  const errors = asRecord(body.errors);
  const firstError = Object.values(errors).flatMap((value) =>
    Array.isArray(value) ? value : [value]
  )[0];

  return typeof firstError === 'string' ? firstError : `Permintaan gagal (${status}).`;
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await fetch(
    endpoint(import.meta.env.VITE_AUTH_LOGIN_ENDPOINT, 'login'),
    {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }
  );
  const body = asRecord(await response.json().catch(() => ({})));

  if (!response.ok) {
    throw new Error(getErrorMessage(body, response.status));
  }

  const data = asRecord(body.data);
  const account = asRecord(data.user ?? body.user ?? data.profile ?? body.profile ?? data);
  const role = normalizeRole(account.role ?? account.user_role ?? data.role ?? body.role);
  const token = text(body.token, body.access_token, data.token, data.access_token);
  const gender = text(account.jenis_kelamin, account.gender);

  return {
    token: token || null,
    role,
    user: {
      nama: text(account.nama, account.name, account.full_name, account.username) || credentials.email,
      nim: text(account.nim, account.student_id, account.nomor_induk),
      prodi: text(account.prodi, account.program_studi, account.study_program),
      email: text(account.email) || credentials.email,
      noTelepon: text(account.noTelepon, account.no_telepon, account.phone),
      jenisKelamin: gender.toLowerCase().startsWith('perempuan') ? 'Perempuan' : 'Laki-laki',
    },
  };
}

export async function logout(token: string | null) {
  const response = await fetch(
    endpoint(import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT, 'logout'),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Logout API gagal (${response.status}).`);
  }
}