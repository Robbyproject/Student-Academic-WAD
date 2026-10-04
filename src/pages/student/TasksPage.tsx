import { useEffect, useState } from 'react';
import { studentRequest, unwrapList } from '../../api/student';
import type { UserProfile } from '../../types/user';

type Task = {
  id: number | string;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  kode_matkul: string;
  nama_matkul: string;
  nama_dosen: string;
};

type TasksPageProps = {
  user: UserProfile;
  token: string | null;
};

function formatDeadline(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

export default function TasksPage({ user, token }: TasksPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTasks() {
    if (!user.mahasiswaId) {
      setError(
        'ID mahasiswa tidak ditemukan pada respons login. Pastikan backend mengembalikan mahasiswa_id atau mahasiswa.id.'
      );
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = await studentRequest<unknown>(
        `/tasks/${encodeURIComponent(user.mahasiswaId)}`,
        token
      );
      setTasks(
        unwrapList<Task>(payload, 'tasks', 'tugas').map((task) => ({
          ...task,
          judul: task.judul ?? 'Tugas',
          deskripsi: task.deskripsi ?? null,
          deadline: task.deadline ?? '',
          kode_matkul: task.kode_matkul ?? '',
          nama_matkul: task.nama_matkul ?? '',
          nama_dosen: task.nama_dosen ?? '',
        }))
      );
    } catch (loadError) {
      console.error('Gagal memuat tugas mahasiswa:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Gagal memuat tugas mahasiswa.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // Load task list for the signed-in student.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.mahasiswaId]);

  const sortedTasks = [...tasks].sort(
    (left, right) =>
      new Date(left.deadline).getTime() - new Date(right.deadline).getTime()
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
            Akademik
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Tugas & Deadline
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar tugas mahasiswa dan batas waktu pengumpulan.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadTasks()}
          type="button"
        >
          Muat Ulang
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat tugas...
        </p>
      ) : error ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : sortedTasks.length ? (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <article
              className="rounded-xl border border-slate-200 border-l-4 border-l-orange-400 p-4"
              key={task.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{task.judul}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {task.kode_matkul && `${task.kode_matkul} · `}
                    {task.nama_matkul || 'Mata kuliah'}
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
                  Deadline {task.deadline ? formatDeadline(task.deadline) : 'belum ditentukan'}
                </span>
              </div>
              {task.deskripsi && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {task.deskripsi}
                </p>
              )}
              {task.nama_dosen && (
                <p className="mt-3 text-xs text-slate-500">
                  Pengampu: {task.nama_dosen}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          Tidak ada tugas yang perlu ditampilkan.
        </p>
      )}
    </section>
  );
}
