import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  type Schedule,
  type SchedulePayload,
} from '../../../api/getSchedules';
import { unwrapList } from '../../../api/student';

type Props = {
  token: string | null;
};

type AcademicClass = {
  id: number;
  nama_kelas: string;
  kode_matkul: string;
  nama_matkul: string;
  nama_dosen: string;
  matkul_id?: number | string;
  dosen_id?: number | string;
};

type ScheduleForm = {
  kelas_id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
};

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const ITEMS_PER_PAGE = 5;

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-600';

const emptyForm: ScheduleForm = {
  kelas_id: '',
  hari: 'Senin',
  jam_mulai: '08:00',
  jam_selesai: '10:00',
  ruangan: '',
};

function normalized(value: unknown): string {
  return String(value ?? '').trim().toLocaleLowerCase();
}

function sameId(left: unknown, right: unknown): boolean {
  return (
    left !== undefined &&
    left !== null &&
    right !== undefined &&
    right !== null &&
    String(left) === String(right)
  );
}

function timeRangesOverlap(
  start: string,
  end: string,
  otherStart: string,
  otherEnd: string,
): boolean {
  return start < otherEnd && end > otherStart;
}

export default function ScheduleManagement({ token }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [scheduleData, classResponse] = await Promise.all([
        getSchedules(token),
        (async () => {
          if (!API_URL) {
            throw new Error('VITE_API_URL belum dikonfigurasi.');
          }

          const response = await fetch(`${API_URL}/academic-classes`, {
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const payload: unknown = await response.json().catch(() => null);

          if (!response.ok) {
            const body = payload as { message?: string } | null;
            throw new Error(
              body?.message ?? 'Gagal mengambil daftar kelas.',
            );
          }

          return payload;
        })(),
      ]);

      setSchedules(scheduleData);

      setClasses(
        unwrapList<AcademicClass>(
          classResponse,
          'classes',
          'academic_classes',
          'kelas',
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data jadwal.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const totalPages = Math.max(
    1,
    Math.ceil(schedules.length / ITEMS_PER_PAGE),
  );

  const paginatedSchedules = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return schedules.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [schedules, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function changeField(field: keyof ScheduleForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(schedule: Schedule) {
    setForm({
      kelas_id: String(schedule.kelas_id),
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai.slice(0, 5),
      jam_selesai: schedule.jam_selesai.slice(0, 5),
      ruangan: schedule.ruangan ?? '',
    });

    setEditingId(Number(schedule.id));
    setError('');
    setNotice('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function findScheduleConflict(payload: SchedulePayload): string | null {
    const selectedClass = classes.find((item) =>
      sameId(item.id, payload.kelas_id),
    );

    const conflicts = schedules.flatMap((schedule) => {
      if (
        Number(schedule.id) === editingId ||
        normalized(schedule.hari) !== normalized(payload.hari) ||
        !timeRangesOverlap(
          payload.jam_mulai,
          payload.jam_selesai,
          schedule.jam_mulai.slice(0, 5),
          schedule.jam_selesai.slice(0, 5),
        )
      ) {
        return [];
      }

      const scheduledClass = classes.find((item) =>
        sameId(item.id, schedule.kelas_id),
      );

      const reasons: string[] = [];

      if (sameId(schedule.kelas_id, payload.kelas_id)) {
        reasons.push('kelas yang sama');
      }

      if (
        (selectedClass?.matkul_id !== undefined &&
          scheduledClass?.matkul_id !== undefined &&
          sameId(selectedClass.matkul_id, scheduledClass.matkul_id)) ||
        (selectedClass?.kode_matkul &&
          normalized(selectedClass.kode_matkul) ===
            normalized(schedule.kode_matkul))
      ) {
        reasons.push('mata kuliah yang sama');
      }

      if (
        (selectedClass?.dosen_id !== undefined &&
          scheduledClass?.dosen_id !== undefined &&
          sameId(selectedClass.dosen_id, scheduledClass.dosen_id)) ||
        (selectedClass?.nama_dosen &&
          normalized(selectedClass.nama_dosen) ===
            normalized(schedule.nama_dosen))
      ) {
        reasons.push('dosen yang sama');
      }

      if (!reasons.length) return [];

      return [
        `${reasons.join(', ')} (${schedule.nama_matkul}, kelas ${
          schedule.nama_kelas
        }, dosen ${schedule.nama_dosen}) pukul ${schedule.jam_mulai.slice(
          0,
          5,
        )}–${schedule.jam_selesai.slice(0, 5)}.`,
      ];
    });

    return conflicts.length
      ? `Jadwal bertabrakan pada ${payload.hari}: ${conflicts.join(' ')}`
      : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!form.kelas_id) {
      setError('Silakan pilih kelas.');
      return;
    }

    if (form.jam_mulai >= form.jam_selesai) {
      setError('Jam selesai harus lebih besar daripada jam mulai.');
      return;
    }

    const payload: SchedulePayload = {
      kelas_id: Number(form.kelas_id),
      hari: form.hari,
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai,
      ruangan: form.ruangan.trim(),
    };

    const conflict = findScheduleConflict(payload);

    if (conflict) {
      setError(conflict);
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateSchedule(editingId, payload, token);
      } else {
        await createSchedule(payload, token);
      }

      const message =
        editingId !== null
          ? 'Jadwal berhasil diperbarui.'
          : 'Jadwal berhasil ditambahkan.';

      resetForm();
      setCurrentPage(1);
      await loadData();
      setNotice(message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan jadwal.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Yakin ingin menghapus jadwal ini?')) return;

    setError('');
    setNotice('');

    try {
      await deleteSchedule(id, token);

      if (editingId === id) {
        resetForm();
      }

      await loadData();
      setNotice('Jadwal berhasil dihapus.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus jadwal.',
      );
    }
  }

  function renderPagination() {
    if (totalPages <= 1) return null;

    const pages: number[] = [];

    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-4">
        <p className="text-xs text-slate-500">
          Menampilkan{' '}
          {schedules.length === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1}
          {'–'}
          {Math.min(currentPage * ITEMS_PER_PAGE, schedules.length)} dari{' '}
          {schedules.length} jadwal
        </p>

        <nav
          aria-label="Navigasi halaman jadwal"
          className="flex flex-wrap items-center gap-1"
        >
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sebelumnya
          </button>

          {pages.map((page) => (
            <button
              key={page}
              type="button"
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => setCurrentPage(page)}
              className={`min-w-8 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                currentPage === page
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Berikutnya
          </button>
        </nav>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
          Administrasi
        </p>

        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Manajemen Jadwal Kuliah
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Kelola jadwal yang sudah dibuat tanpa membuat ulang kelasnya.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {notice}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
          Kelas
          <select
            className={inputClass}
            value={form.kelas_id}
            onChange={(event) =>
              changeField('kelas_id', event.target.value)
            }
            required
          >
            <option value="">Pilih kelas</option>

            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.kode_matkul} - {item.nama_matkul} ({item.nama_kelas}) -{' '}
                {item.nama_dosen}
              </option>
            ))}
          </select>

          {classes.length === 0 && (
            <span className="mt-1 block text-xs text-amber-700">
              Belum ada kelas. Buat kelas terlebih dahulu di bagian Kelas &
              Jadwal.
            </span>
          )}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Hari
          <select
            className={inputClass}
            value={form.hari}
            onChange={(event) => changeField('hari', event.target.value)}
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Jam Mulai
          <input
            type="time"
            className={inputClass}
            value={form.jam_mulai}
            onChange={(event) =>
              changeField('jam_mulai', event.target.value)
            }
            required
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Jam Selesai
          <input
            type="time"
            className={inputClass}
            value={form.jam_selesai}
            onChange={(event) =>
              changeField('jam_selesai', event.target.value)
            }
            required
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
          Ruangan
          <input
            className={inputClass}
            value={form.ruangan}
            onChange={(event) => changeField('ruangan', event.target.value)}
            placeholder="Contoh: Lab Komputer"
            maxLength={100}
          />
        </label>

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={saving || loading || classes.length === 0}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving
              ? 'Menyimpan...'
              : editingId !== null
                ? 'Simpan Perubahan'
                : 'Tambah Jadwal'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              Batal Edit
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Daftar Jadwal</h3>

        <button
          type="button"
          onClick={() => void loadData()}
          className="text-sm font-semibold text-cyan-800 hover:underline"
        >
          Muat ulang
        </button>
      </div>

      {loading ? (
        <p className="py-5 text-sm text-slate-500">
          Memuat data jadwal...
        </p>
      ) : schedules.length === 0 ? (
        <p className="py-5 text-sm text-slate-500">
          Belum ada jadwal kuliah.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Mata Kuliah</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3">Dosen</th>
                  <th className="p-3">Hari / Jam</th>
                  <th className="p-3">Ruangan</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-3">
                      <p className="font-medium">
                        {schedule.nama_matkul}
                      </p>
                      <p className="text-xs text-slate-500">
                        {schedule.kode_matkul}
                      </p>
                    </td>

                    <td className="p-3">{schedule.nama_kelas}</td>

                    <td className="p-3">{schedule.nama_dosen}</td>

                    <td className="p-3">
                      <p>{schedule.hari}</p>
                      <p className="text-xs text-slate-500">
                        {schedule.jam_mulai.slice(0, 5)}–
                        {schedule.jam_selesai.slice(0, 5)}
                      </p>
                    </td>

                    <td className="p-3">{schedule.ruangan || '-'}</td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(schedule)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(Number(schedule.id))
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </div>
      )}
    </section>
  );
}