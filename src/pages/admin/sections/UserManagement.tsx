import { useEffect, useState, type FormEvent } from 'react';
import { studentRequest, unwrapList, unwrapRecord } from '../../../api/student';

type Account = {
  name: string;
  email: string;
  nim: string;
  departmentName: string;
  angkatan: number;
};

type Department = {
  id: number;
  kode_jurusan: string;
  nama_jurusan: string;
};

type Props = {
  token: string | null;
};

const inputClass =
  'mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600';

function findNim(value: unknown, depth = 0): string {
  if (!value || typeof value !== 'object' || depth > 4) return '';
  if (Array.isArray(value)) {
    for (const item of value) {
      const nim = findNim(item, depth + 1);
      if (nim) return nim;
    }
    return '';
  }

  const record = value as Record<string, unknown>;
  if (typeof record.nim === 'string' || typeof record.nim === 'number') {
    return String(record.nim);
  }
  for (const key of ['data', 'mahasiswa', 'user', 'profile']) {
    const nim = findNim(record[key], depth + 1);
    if (nim) return nim;
  }
  return '';
}

export default function UserManagement({ token }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [angkatan, setAngkatan] = useState(String(new Date().getFullYear()));
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const payload = await studentRequest<unknown>('/admin/jurusan', token);
        const nextDepartments = unwrapList<Department>(
          payload,
          'jurusan',
          'departments'
        );
        if (active) {
          setDepartments(nextDepartments);
          setDepartmentId((current) =>
            current || (nextDepartments.length ? String(nextDepartments[0].id) : '')
          );
        }
      } catch (loadError) {
        console.error('Gagal memuat jurusan untuk akun mahasiswa:', loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Gagal memuat daftar jurusan.'
          );
        }
      } finally {
        if (active) setLoadingDepartments(false);
      }
    };
    const timeoutId = window.setTimeout(() => void loadDepartments(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const payload = await studentRequest<unknown>('/admin/users', token, {
        method: 'POST',
        body: JSON.stringify({
          nama: name.trim(),
          email: email.trim(),
          password,
          jurusan_id: Number(departmentId),
          angkatan: Number(angkatan),
          role: 'mahasiswa',
        }),
      });
      const nim = findNim(payload) || findNim(unwrapRecord(payload));
      const departmentName =
        departments.find((department) => String(department.id) === departmentId)
          ?.nama_jurusan ?? '';
      setAccounts((current) => [{
        name: name.trim(),
        email: email.trim(),
        nim,
        departmentName,
        angkatan: Number(angkatan),
      }, ...current]);
      setNotice(
        nim
          ? `Akun mahasiswa berhasil dibuat. NIM: ${nim}.`
          : 'Akun mahasiswa berhasil dibuat, tetapi respons backend tidak menyertakan NIM.'
      );
      setName('');
      setEmail('');
      setPassword('');
    } catch (submitError) {
      console.error('Gagal membuat akun mahasiswa:', submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Gagal membuat akun mahasiswa.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Pengguna
        </p>
        <h2 className="mt-1 text-lg font-semibold">Buat akun mahasiswa</h2>
        <p className="mt-1 text-sm text-slate-500">
          Akun, profil akademik, dan NIM mahasiswa dibuat sekaligus oleh backend.
          Gunakan alamat email kampus yang domainnya diizinkan oleh sistem.
        </p>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={handleSubmit}
      >
        <label className="text-sm font-medium text-slate-700">
          Nama
          <input
            className={inputClass}
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            className={inputClass}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Password
          <input
            className={inputClass}
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Jurusan
          <select
            className={inputClass}
            disabled={loadingDepartments || departments.length === 0}
            onChange={(event) => setDepartmentId(event.target.value)}
            required
            value={departmentId}
          >
            <option value="">Pilih jurusan</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.kode_jurusan} - {department.nama_jurusan}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Angkatan
          <input
            className={inputClass}
            max="2100"
            min="2000"
            onChange={(event) => setAngkatan(event.target.value)}
            required
            type="number"
            value={angkatan}
          />
        </label>
        <button
          className="h-10 self-end rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={saving || loadingDepartments || departments.length === 0}
          type="submit"
        >
          {saving ? 'Menyimpan...' : 'Buat akun'}
        </button>
      </form>

      {departments.length === 0 && !loadingDepartments && !error && (
        <p className="mt-3 text-sm text-amber-700">
          Tambahkan jurusan terlebih dahulu sebelum membuat akun mahasiswa.
        </p>
      )}

      {(error || notice) && (
        <p
          aria-live="polite"
          className={`mt-3 text-sm ${error ? 'text-red-700' : 'text-emerald-700'}`}
        >
          {error || notice}
        </p>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-y border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="py-3 font-medium">Nama</th>
              <th className="py-3 font-medium">Email</th>
              <th className="py-3 font-medium">NIM</th>
              <th className="py-3 font-medium">Jurusan</th>
              <th className="py-3 font-medium">Angkatan</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length ? (
              accounts.map((account, index) => (
                <tr
                  className="border-b border-slate-100"
                  key={`${account.email}-${index}`}
                >
                  <td className="py-3 font-medium">{account.name}</td>
                  <td className="py-3 text-slate-600">{account.email}</td>
                  <td className="py-3 text-slate-600">{account.nim || 'Tidak dikembalikan'}</td>
                  <td className="py-3 text-slate-600">{account.departmentName || '—'}</td>
                  <td className="py-3 text-slate-600">{account.angkatan}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-5 text-slate-500" colSpan={5}>
                  Belum ada akun mahasiswa yang dibuat pada sesi ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Tabel menampilkan akun yang dibuat pada sesi ini; muat ulang halaman akan
        mengosongkan daftar pratinjau.
      </p>
    </section>
  );
}
