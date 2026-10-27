import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { studentRequest, unwrapList, unwrapRecord } from '../../../api/student';

type Department = {
  id: number;
  kode_jurusan: string;
  nama_jurusan: string;
};

type Lecturer = {
  id: number;
  nama: string;
  nidn: string;
  jurusan_id: number;
  email: string;
};

type Props = {
  token: string | null;
};

const inputClass =
  'mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600';
const buttonClass =
  'rounded-md px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50';

function extractItem<T>(payload: unknown, key: string): T {
  const record = unwrapRecord(payload);
  const item = record[key];
  return (item && typeof item === 'object' ? item : record) as T;
}

async function getDepartments(token: string | null) {
  const payload = await studentRequest<unknown>('/admin/jurusan', token);
  return unwrapList<Department>(payload, 'jurusan', 'departments');
}

const LECTURERS_PER_PAGE = 10;

type LecturerPage = {
  items: Lecturer[];
  currentPage: number;
  totalPages: number;
  total: number;
};

async function getLecturers(
  token: string | null,
  departmentId = '',
  page = 1,
  perPage = LECTURERS_PER_PAGE
): Promise<LecturerPage> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (departmentId) {
    query.set('jurusan_id', departmentId);
  }
  const payload = await studentRequest<unknown>(
    `/admin/dosen?${query.toString()}`,
    token
  );
  const items = unwrapList<Lecturer>(payload, 'dosen', 'lecturers');
  const meta =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};
  return {
    items,
    currentPage: Math.max(1, Number(meta.current_page ?? page)),
    totalPages: Math.max(1, Number(meta.last_page ?? 1)),
    total: Number(meta.total ?? items.length),
  };
}

export default function LecturerManagement({ token }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerNidn, setLecturerNidn] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  const [lecturerPassword, setLecturerPassword] = useState('');
  const [lecturerDepartmentId, setLecturerDepartmentId] = useState('');
  const [lecturerFilter, setLecturerFilter] = useState('');
  const [lecturerPage, setLecturerPage] = useState(1);
  const [lecturerTotalPages, setLecturerTotalPages] = useState(1);
  const [lecturerTotal, setLecturerTotal] = useState(0);
  const [refreshingLecturers, setRefreshingLecturers] = useState(false);
  const [editingLecturerId, setEditingLecturerId] = useState<number | null>(null);
  const [savingLecturer, setSavingLecturer] = useState(false);
  const [deletingLecturerId, setDeletingLecturerId] = useState<number | null>(null);
  const [lecturerMessage, setLecturerMessage] = useState('');
  const [lecturerError, setLecturerError] = useState('');

  const refreshData = useCallback(
    async (departmentId = lecturerFilter, page = lecturerPage) => {
      setRefreshingLecturers(true);
      try {
        const [nextDepartments, lecturerResult] = await Promise.all([
          getDepartments(token),
          getLecturers(token, departmentId, page),
        ]);

        let result = lecturerResult;

        // Halaman yang diminta bisa hilang setelah menghapus data terakhir
        // di halaman itu; kembali ke halaman terakhir yang tersedia.
        if (page > result.totalPages) {
          result = await getLecturers(token, departmentId, result.totalPages);
        }

        setDepartments(nextDepartments);
        setLecturers(result.items);
        setLecturerPage(result.currentPage);
        setLecturerTotalPages(result.totalPages);
        setLecturerTotal(result.total);
        setLecturerDepartmentId((current) =>
          nextDepartments.some((department) => String(department.id) === current)
            ? current
            : nextDepartments.length
              ? String(nextDepartments[0].id)
              : ''
        );
      } finally {
        setRefreshingLecturers(false);
      }
    },
    [lecturerFilter, lecturerPage, token]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setDataError('');
      try {
        const [nextDepartments, lecturerResult] = await Promise.all([
          getDepartments(token),
          getLecturers(token, '', 1),
        ]);
        if (active) {
          setDepartments(nextDepartments);
          setLecturers(lecturerResult.items);
          setLecturerPage(lecturerResult.currentPage);
          setLecturerTotalPages(lecturerResult.totalPages);
          setLecturerTotal(lecturerResult.total);
          setLecturerDepartmentId((current) =>
            nextDepartments.some((department) => String(department.id) === current)
              ? current
              : nextDepartments.length
                ? String(nextDepartments[0].id)
                : ''
          );
        }
      } catch (error) {
        console.error('Gagal memuat data dosen dan jurusan:', error);
        if (active) {
          setDataError(
            error instanceof Error
              ? error.message
              : 'Gagal memuat daftar dosen dan jurusan.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [token]);

  async function saveLecturer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLecturerError('');
    setLecturerMessage('');
    setSavingLecturer(true);
    const isEditing = editingLecturerId !== null;
    try {
      await studentRequest<unknown>(
        isEditing ? `/admin/dosen/${editingLecturerId}` : '/admin/dosen',
        token,
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify({
            nama: lecturerName.trim(),
            nidn: lecturerNidn.trim(),
            jurusan_id: Number(lecturerDepartmentId),
            email: lecturerEmail.trim(),
            ...(lecturerPassword ? { password: lecturerPassword } : {}),
          }),
        }
      );
      setLecturerName('');
      setLecturerNidn('');
      setLecturerEmail('');
      setLecturerPassword('');
      setEditingLecturerId(null);
      setLecturerFilter(lecturerDepartmentId);
      setLecturerMessage(
        isEditing ? 'Data dosen berhasil diperbarui.' : 'Dosen berhasil ditambahkan.'
      );
      try {
        await refreshData(
          lecturerDepartmentId,
          isEditing ? lecturerPage : 1
        );
      } catch (error) {
        console.error('Dosen tersimpan, tetapi daftar gagal diperbarui:', error);
        setLecturerError(
          error instanceof Error
            ? `Data tersimpan, tetapi daftar gagal diperbarui: ${error.message}`
            : 'Data tersimpan, tetapi daftar gagal diperbarui.'
        );
      }
    } catch (error) {
      console.error('Gagal menyimpan data dosen:', error);
      setLecturerError(
        error instanceof Error ? error.message : 'Gagal menyimpan data dosen.'
      );
    } finally {
      setSavingLecturer(false);
    }
  }

  async function editLecturer(id: number) {
    setLecturerError('');
    setLecturerMessage('');
    try {
      const payload = await studentRequest<unknown>(`/admin/dosen/${id}`, token);
      const lecturer = extractItem<Lecturer>(payload, 'dosen');
      setLecturerName(lecturer.nama);
      setLecturerNidn(lecturer.nidn);
      setLecturerEmail(lecturer.email);
      setLecturerPassword('');
      setLecturerDepartmentId(String(lecturer.jurusan_id));
      setEditingLecturerId(id);
    } catch (error) {
      console.error('Gagal mengambil detail dosen:', error);
      setLecturerError(
        error instanceof Error ? error.message : 'Gagal mengambil detail dosen.'
      );
    }
  }

  async function deleteLecturer(lecturer: Lecturer) {
    if (!window.confirm(`Hapus dosen "${lecturer.nama}"?`)) return;
    setLecturerError('');
    setLecturerMessage('');
    setDeletingLecturerId(lecturer.id);
    try {
      await studentRequest<unknown>(`/admin/dosen/${lecturer.id}`, token, {
        method: 'DELETE',
      });
      if (editingLecturerId === lecturer.id) {
        setEditingLecturerId(null);
        setLecturerName('');
        setLecturerNidn('');
        setLecturerEmail('');
        setLecturerPassword('');
      }
      setLecturerMessage('Dosen berhasil dihapus.');
      try {
        await refreshData();
      } catch (error) {
        console.error('Dosen terhapus, tetapi daftar gagal diperbarui:', error);
        setLecturerError(
          error instanceof Error
            ? `Dosen terhapus, tetapi daftar gagal diperbarui: ${error.message}`
            : 'Dosen terhapus, tetapi daftar gagal diperbarui.'
        );
      }
    } catch (error) {
      console.error('Gagal menghapus dosen:', error);
      setLecturerError(
        error instanceof Error ? error.message : 'Gagal menghapus dosen.'
      );
    } finally {
      setDeletingLecturerId(null);
    }
  }

  async function filterLecturers(departmentId: string) {
    setLecturerFilter(departmentId);
    setLecturerError('');
    try {
      await refreshData(departmentId, 1);
    } catch (error) {
      console.error('Gagal memfilter daftar dosen:', error);
      setLecturerError(
        error instanceof Error ? error.message : 'Gagal memuat daftar dosen.'
      );
    }
  }

  function goToLecturerPage(page: number) {
    void refreshData(lecturerFilter, page);
  }

  function renderLecturerPagination() {
    if (lecturerTotal === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 py-3">
        <p className="text-xs text-slate-500">
          Menampilkan {(lecturerPage - 1) * LECTURERS_PER_PAGE + 1}–
          {Math.min(lecturerPage * LECTURERS_PER_PAGE, lecturerTotal)} dari{' '}
          {lecturerTotal} dosen
        </p>

        <nav
          aria-label="Navigasi halaman dosen"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            disabled={lecturerPage <= 1 || refreshingLecturers}
            onClick={() => goToLecturerPage(lecturerPage - 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>

          <span className="text-xs font-medium text-slate-600">
            Halaman {lecturerPage} dari {lecturerTotalPages}
          </span>

          <button
            type="button"
            disabled={
              lecturerPage >= lecturerTotalPages || refreshingLecturers
            }
            onClick={() => goToLecturerPage(lecturerPage + 1)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </nav>
      </div>
    );
  }

  const departmentsById = new Map(
    departments.map((department) => [String(department.id), department])
  );

  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
          Data Akademik
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Manajemen Dosen
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tambahkan dan kelola dosen. Jurusan dikelola melalui bagian Manajemen
          Jurusan.
        </p>
      </div>

      {dataError && (
        <p
          aria-live="polite"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {dataError}
        </p>
      )}

      <h3 className="mb-3 text-base font-semibold text-slate-900">
        {editingLecturerId ? 'Edit Dosen' : 'Tambah Dosen'}
      </h3>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveLecturer}>
        <label className="text-sm font-medium text-slate-700">
          Email Akun
          <input
            className={inputClass}
            autoComplete="email"
            onChange={(event) => setLecturerEmail(event.target.value)}
            placeholder="dosen@kampus.ac.id"
            required
            type="email"
            value={lecturerEmail}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Nama Dosen
          <input
            className={inputClass}
            maxLength={150}
            onChange={(event) => setLecturerName(event.target.value)}
            required
            value={lecturerName}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          NIDN
          <input
            className={inputClass}
            maxLength={30}
            onChange={(event) => setLecturerNidn(event.target.value)}
            required
            value={lecturerNidn}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {editingLecturerId ? 'Password Baru (opsional)' : 'Password Akun'}
          <input
            className={inputClass}
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setLecturerPassword(event.target.value)}
            required={!editingLecturerId}
            type="password"
            value={lecturerPassword}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            {editingLecturerId
              ? 'Kosongkan jika tidak ingin mengganti password.'
              : 'Akun dosen dibuat bersamaan dengan profil dosen.'}
          </span>
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Jurusan
          <select
            className={inputClass}
            disabled={loading || departments.length === 0}
            onChange={(event) => setLecturerDepartmentId(event.target.value)}
            required
            value={lecturerDepartmentId}
          >
            <option value="">Pilih jurusan</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.kode_jurusan} - {department.nama_jurusan}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button
            className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={savingLecturer || loading || departments.length === 0}
            type="submit"
          >
            {savingLecturer
              ? 'Menyimpan...'
              : editingLecturerId
                ? 'Simpan Perubahan'
                : 'Tambah Dosen'}
          </button>
          {editingLecturerId !== null && (
            <button
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"
              onClick={() => {
                setEditingLecturerId(null);
                setLecturerName('');
                setLecturerNidn('');
                setLecturerEmail('');
                setLecturerPassword('');
              }}
              type="button"
            >
              Batal
            </button>
          )}
        </div>
        {(lecturerError || lecturerMessage) && (
          <p
            aria-live="polite"
            className={`sm:col-span-2 text-sm ${
              lecturerError ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {lecturerError || lecturerMessage}
          </p>
        )}
      </form>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-700">
          Filter daftar berdasarkan jurusan
          <select
            className={inputClass}
            onChange={(event) => void filterLecturers(event.target.value)}
            value={lecturerFilter}
          >
            <option value="">Semua jurusan</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.kode_jurusan} - {department.nama_jurusan}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-y border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="py-3 pr-3 font-medium">Nama Dosen</th>
              <th className="py-3 pr-3 font-medium">NIDN</th>
              <th className="py-3 pr-3 font-medium">Email</th>
              <th className="py-3 pr-3 font-medium">Jurusan</th>
              <th className="py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr className="border-b border-slate-100" key={lecturer.id}>
                <td className="py-3 pr-3 font-medium">{lecturer.nama}</td>
                <td className="py-3 pr-3 text-slate-600">{lecturer.nidn}</td>
                <td className="py-3 pr-3 text-slate-600">{lecturer.email}</td>
                <td className="py-3 pr-3 text-slate-600">
                  {departmentsById.get(String(lecturer.jurusan_id))?.nama_jurusan ??
                    `Jurusan ${lecturer.jurusan_id}`}
                </td>
                <td className="py-3">
                  <div className="flex gap-1.5">
                    <button
                      className={`${buttonClass} text-cyan-800 hover:bg-cyan-50`}
                      disabled={savingLecturer || deletingLecturerId !== null}
                      onClick={() => void editLecturer(lecturer.id)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className={`${buttonClass} text-red-700 hover:bg-red-50`}
                      disabled={deletingLecturerId !== null}
                      onClick={() => void deleteLecturer(lecturer)}
                      type="button"
                    >
                      {deletingLecturerId === lecturer.id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && lecturers.length === 0 && (
              <tr>
                <td className="py-5 text-slate-500" colSpan={5}>
                  Belum ada data dosen untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {renderLecturerPagination()}
      </div>
    </section>
  );
}
