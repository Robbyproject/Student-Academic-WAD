import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { studentRequest, unwrapList } from '../../../api/student';

type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

type TaughtClass = {
  id: number;
  nama_kelas: string;
  tahun_ajaran: string;
  term: string | null;
  kode_matkul: string;
  nama_matkul: string;
  jurusan_id: number;
  kode_jurusan: string;
  nama_jurusan: string;
  jumlah_peserta: number;
};

type Participant = {
  id: number;
  nim: string;
  nama: string;
  angkatan: number;
  semester: number | null;
  status: AttendanceStatus | null;
};

type AttendanceSummary = {
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  tercatat: number;
  total: number;
  belum_dicatat: number;
};

type ParticipantsPayload = {
  data: Participant[];
  current_page: number;
  last_page: number;
  total: number;
  kelas: {
    id: number;
    nama_kelas: string;
    tahun_ajaran: string;
    term: string | null;
    semester_label: string;
    kode_matkul: string;
    nama_matkul: string;
    kode_jurusan: string;
    nama_jurusan: string;
    jumlah_peserta: number;
  };
  rekap: AttendanceSummary;
};

type MeetingEntry = {
  tanggal: string;
  tercatat: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
};

type Props = { token: string | null };

const PER_PAGE = 10;

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; active: string }[] = [
  { value: 'hadir', label: 'Hadir', active: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'izin', label: 'Izin', active: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'sakit', label: 'Sakit', active: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'alpa', label: 'Alpa', active: 'bg-red-50 text-red-700 border-red-200' },
];

function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

async function getTaughtClasses(token: string | null): Promise<TaughtClass[]> {
  const payload = await studentRequest<unknown>('/dosen/absensi/kelas', token);
  return unwrapList<TaughtClass>(payload);
}

async function getParticipants(
  token: string | null,
  classId: number,
  tanggal: string,
  page: number
): Promise<ParticipantsPayload> {
  const query = new URLSearchParams({
    tanggal,
    page: String(page),
    per_page: String(PER_PAGE),
  });
  return studentRequest<ParticipantsPayload>(
    `/dosen/absensi/kelas/${classId}?${query.toString()}`,
    token
  );
}

async function getMeetings(token: string | null, classId: number): Promise<MeetingEntry[]> {
  return studentRequest<MeetingEntry[]>(`/dosen/absensi/kelas/${classId}/pertemuan`, token);
}

export default function AttendancePanel({ token }: Props) {
  const [classes, setClasses] = useState<TaughtClass[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tanggal, setTanggal] = useState(todayISO());
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState<ParticipantsPayload | null>(null);
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await getTaughtClasses(token);
          if (active) setClasses(data);
        } catch (err) {
          if (active) {
            setError(
              err instanceof Error ? err.message : 'Gagal memuat daftar kelas.'
            );
          }
        } finally {
          if (active) setLoadingClasses(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [token]);

  const departmentOptions = useMemo(() => {
    const map = new Map<number, { id: number; kode: string; nama: string }>();
    classes.forEach((item) => {
      if (!map.has(item.jurusan_id)) {
        map.set(item.jurusan_id, {
          id: item.jurusan_id,
          kode: item.kode_jurusan,
          nama: item.nama_jurusan,
        });
      }
    });
    return [...map.values()];
  }, [classes]);

  const filteredClasses = useMemo(
    () =>
      departmentFilter
        ? classes.filter(
            (item) => String(item.jurusan_id) === departmentFilter
          )
        : classes,
    [classes, departmentFilter]
  );

  // Ref agar hanya memuat ulang daftar pertemuan saat kelas berganti.
  const meetingsForClass = useRef(NaN);

  const loadParticipants = useCallback(
    async (classId: number, date: string, targetPage: number) => {
      setLoadingParticipants(true);
      setError('');
      setNotice('');
      try {
        if (meetingsForClass.current !== classId) {
          meetingsForClass.current = classId;
          setMeetings(await getMeetings(token, classId));
        }
        const result = await getParticipants(token, classId, date, targetPage);
        let loaded = result;
        if (targetPage > result.last_page) {
          loaded = await getParticipants(token, classId, date, result.last_page);
        }
        setPayload(loaded);
        setPage(loaded.current_page);
        setStatuses((current) => {
          const next = { ...current };
          loaded.data.forEach((student) => {
            if (!next[student.id]) {
              next[student.id] = student.status ?? 'hadir';
            }
          });
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Gagal memuat daftar peserta.'
        );
        setPayload(null);
        setPage(1);
      } finally {
        setLoadingParticipants(false);
      }
    },
    [token]
  );

  function handleClassChange(value: string) {
    setSelectedClassId(value);
    setPayload(null);
    setMeetings([]);
    meetingsForClass.current = NaN;
  }

  useEffect(() => {
    const classId = Number(selectedClassId);
    if (!classId) return;

    const timeoutId = window.setTimeout(() => {
      void loadParticipants(classId, tanggal, page);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, tanggal]);

  function chooseStatus(studentId: number, status: AttendanceStatus) {
    setStatuses((current) => ({ ...current, [studentId]: status }));
  }

  async function saveAttendance() {
    const classId = Number(selectedClassId);
    if (!classId || !payload) return;

    setSaving(true);
    setError('');
    setNotice('');

    try {
      const entries = payload.data.map((student) => ({
        mahasiswa_id: student.id,
        status: statuses[student.id] ?? 'hadir',
      }));

      const result = await studentRequest<{ message: string; rekap: AttendanceSummary }>(
        `/dosen/absensi/kelas/${classId}`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({ tanggal, entries }),
        }
      );

      setNotice(result.message);
      setPayload((current) =>
        current
          ? {
              ...current,
              rekap: result.rekap,
              data: current.data.map((student) => ({
                ...student,
                status: statuses[student.id] ?? 'hadir',
              })),
            }
          : current
      );
      setMeetings(await getMeetings(token, classId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan absensi.'
      );
    } finally {
      setSaving(false);
    }
  }

  const kelasInfo = payload?.kelas;
  const rekap = payload?.rekap;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Kehadiran
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Absensi Perkuliahan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Catat kehadiran manual peserta kelas yang Anda ajarkan, dikelompokkan
            per jurusan.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {notice}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Jurusan
          <select
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value);
              handleClassChange('');
            }}
          >
            <option value="">Semua jurusan yang diajar</option>
            {departmentOptions.map((department) => (
              <option key={department.id} value={department.id}>
                {department.kode} - {department.nama}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Kelas
          <select
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
            disabled={loadingClasses || filteredClasses.length === 0}
            value={selectedClassId}
            onChange={(event) => handleClassChange(event.target.value)}
          >
            <option value="">Pilih kelas</option>
            {filteredClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_matkul} ({item.nama_kelas}) - {item.nama_jurusan}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Tanggal
          <input
            type="date"
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
            value={tanggal}
            onChange={(event) => setTanggal(event.target.value)}
          />
        </label>
      </div>

      {loadingClasses ? (
        <p className="py-6 text-sm text-slate-500">Memuat daftar kelas...</p>
      ) : classes.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">
          Belum ada kelas yang diajar. Kelas dibuat oleh admin di bagian Kelas &
          Jadwal.
        </p>
      ) : !selectedClassId ? (
        <p className="py-6 text-sm text-slate-500">
          Pilih jurusan dan kelas di atas untuk menampilkan daftar absensi.
        </p>
      ) : loadingParticipants || !payload ? (
        <p className="py-6 text-sm text-slate-500">Memuat daftar peserta...</p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {kelasInfo?.semester_label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {kelasInfo?.kode_matkul} - {kelasInfo?.nama_matkul}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              {kelasInfo?.nama_jurusan}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              Hadir {rekap?.hadir ?? 0}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
              Izin {rekap?.izin ?? 0}
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              Sakit {rekap?.sakit ?? 0}
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">
              Alpa {rekap?.alpa ?? 0}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              Belum dicatat {rekap?.belum_dicatat ?? 0} / {rekap?.total ?? 0}
            </span>
          </div>

          {meetings.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Pertemuan tersimpan:
              </span>
              {meetings.map((meeting) => (
                <button
                  key={meeting.tanggal}
                  type="button"
                  onClick={() => setTanggal(meeting.tanggal)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                    meeting.tanggal === tanggal
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title={`Hadir ${meeting.hadir}, izin ${meeting.izin}, sakit ${meeting.sakit}, alpa ${meeting.alpa}`}
                >
                  {meeting.tanggal} ({meeting.tercatat} tercatat)
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-y border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-3 pr-3 font-medium">Mahasiswa</th>
                  <th className="py-3 pr-3 font-medium">Semester</th>
                  <th className="py-3 font-medium">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {payload.data.map((student) => (
                  <tr className="border-b border-slate-100" key={student.id}>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-slate-800">{student.nama}</p>
                      <p className="text-xs text-slate-500">NIM {student.nim}</p>
                    </td>
                    <td className="py-3 pr-3 text-slate-600">
                      {student.semester ? `Semester ${student.semester}` : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((option) => {
                          const selected =
                            (statuses[student.id] ?? 'hadir') === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => chooseStatus(student.id, option.value)}
                              className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                selected
                                  ? option.active
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
                {payload.data.length === 0 && (
                  <tr>
                    <td className="py-5 text-slate-500" colSpan={3}>
                      Belum ada peserta di kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-1 py-3">
              <p className="text-xs text-slate-500">
                Menampilkan {(payload.current_page - 1) * PER_PAGE + 1}–
                {Math.min(payload.current_page * PER_PAGE, payload.total)} dari{' '}
                {payload.total} peserta
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={payload.current_page <= 1 || loadingParticipants}
                  onClick={() =>
                    void loadParticipants(
                      Number(selectedClassId),
                      tanggal,
                      payload.current_page - 1
                    )
                  }
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <span className="text-xs font-medium text-slate-600">
                  Halaman {payload.current_page} dari {payload.last_page}
                </span>

                <button
                  type="button"
                  disabled={
                    payload.current_page >= payload.last_page ||
                    loadingParticipants
                  }
                  onClick={() =>
                    void loadParticipants(
                      Number(selectedClassId),
                      tanggal,
                      payload.current_page + 1
                    )
                  }
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={saving || loadingParticipants}
              onClick={() => void saveAttendance()}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Menyimpan...'
                : `Simpan Absensi ${tanggal}`}
            </button>
            <p className="text-xs text-slate-400">
              Status bertanda khusus halaman ini yang disimpan. Pindah halaman
              lalu simpan lagi untuk kelas besar.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
