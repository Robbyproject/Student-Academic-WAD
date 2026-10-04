import { useEffect, useState } from 'react';
import { studentRequest, unwrapList } from '../../api/student';

type Schedule = {
  id: number | string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  nama_kelas: string;
  kode_matkul: string;
  nama_matkul: string;
  nama_dosen: string;
};

type SchedulePageProps = {
  token: string | null;
};

const DAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export default function SchedulePage({ token }: SchedulePageProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSchedules() {
    setLoading(true);
    setError('');
    try {
      const payload = await studentRequest<unknown>('/schedules', token);
      setSchedules(
        unwrapList<Schedule>(payload, 'schedules', 'jadwal').map(
          (schedule, index) => ({
            ...schedule,
            id: schedule.id ?? `schedule-${index}`,
            hari: schedule.hari ?? '',
            jam_mulai: schedule.jam_mulai ?? '',
            jam_selesai: schedule.jam_selesai ?? '',
            ruangan: schedule.ruangan ?? '',
            nama_kelas: schedule.nama_kelas ?? '',
            kode_matkul: schedule.kode_matkul ?? '',
            nama_matkul: schedule.nama_matkul ?? '',
            nama_dosen: schedule.nama_dosen ?? '',
          })
        )
      );
    } catch (loadError) {
      console.error('Gagal memuat jadwal kuliah:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Gagal memuat jadwal kuliah.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSchedules();
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // Load the schedule for the active authenticated session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const orderedSchedules = [...schedules].sort((left, right) => {
    const dayComparison =
      DAYS.indexOf(left.hari) - DAYS.indexOf(right.hari);
    return dayComparison || left.jam_mulai.localeCompare(right.jam_mulai);
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
            Akademik
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Jadwal Kuliah
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Jadwal kelas, waktu perkuliahan, ruangan, dan dosen pengampu.
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={loading}
          onClick={() => void loadSchedules()}
          type="button"
        >
          Muat Ulang
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat jadwal...
        </p>
      ) : error ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : orderedSchedules.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-y border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 font-medium">Hari</th>
                <th className="py-3 font-medium">Waktu</th>
                <th className="py-3 font-medium">Mata Kuliah</th>
                <th className="py-3 font-medium">Kelas / Ruangan</th>
                <th className="py-3 font-medium">Dosen</th>
              </tr>
            </thead>
            <tbody>
              {orderedSchedules.map((schedule) => (
                <tr className="border-b border-slate-100" key={schedule.id}>
                  <td className="py-3 font-medium text-slate-800">
                    {schedule.hari || 'Belum ditentukan'}
                  </td>
                  <td className="whitespace-nowrap py-3 text-slate-600">
                    {schedule.jam_mulai}–{schedule.jam_selesai}
                  </td>
                  <td className="py-3">
                    <p className="font-medium text-slate-800">
                      {schedule.nama_matkul || 'Mata kuliah'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {schedule.kode_matkul}
                    </p>
                  </td>
                  <td className="py-3 text-slate-600">
                    <p>{schedule.nama_kelas || '-'}</p>
                    <p className="text-xs text-slate-500">
                      {schedule.ruangan || 'Ruangan belum ditentukan'}
                    </p>
                  </td>
                  <td className="py-3 text-slate-600">
                    {schedule.nama_dosen || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          Belum ada jadwal kuliah.
        </p>
      )}
    </section>
  );
}
