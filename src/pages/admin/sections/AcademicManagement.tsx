import { useEffect, useMemo, useState, type FormEvent } from 'react';

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
};

type Course = {
  id: number;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  jurusan_id: number;
};

type AcademicClass = {
  id: number;
  nama_kelas: string;
  tahun_ajaran: string;
  term?: 'ganjil' | 'genap';
  kode_matkul: string;
  nama_matkul: string;
  nama_dosen: string;
};

type Props = {
  token: string | null;
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const inputClass =
  'mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-100 disabled:text-slate-400';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getCollection<T>(payload: unknown, key: string): T[] {
  let current = payload;
  for (let depth = 0; depth < 3; depth += 1) {
    if (Array.isArray(current)) return current as T[];
    const record = asRecord(current);
    if (Array.isArray(record[key])) return record[key] as T[];
    current = record.data ?? record[key];
  }
  return [];
}

function responseError(payload: unknown, status: number): string {
  const body = asRecord(payload);
  if (typeof body.message === 'string') return body.message;
  const errors = asRecord(body.errors);
  const firstError = Object.values(errors).flatMap((value) =>
    Array.isArray(value) ? value : [value]
  )[0];
  return typeof firstError === 'string'
    ? firstError
    : `Permintaan gagal (${status}).`;
}

export default function AcademicManagement({ token }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  const [departmentId, setDepartmentId] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [className, setClassName] = useState('');
  const [yearStart, setYearStart] = useState('2026');
  const [term, setTerm] = useState<'ganjil' | 'genap'>('ganjil');
  const [day, setDay] = useState('Senin');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [savingClass, setSavingClass] = useState(false);
  const [classError, setClassError] = useState('');
  const [classNotice, setClassNotice] = useState('');

  const [selectedClassId, setSelectedClassId] = useState('');
  const [offeringYearStart, setOfferingYearStart] = useState('2026');
  const [offeringTerm, setOfferingTerm] =
    useState<'ganjil' | 'genap'>('ganjil');
  const [savingOffering, setSavingOffering] = useState(false);
  const [offeringError, setOfferingError] = useState('');
  const [offeringNotice, setOfferingNotice] = useState('');

  const filteredLecturers = useMemo(
    () =>
      lecturers.filter(
        (lecturer) => String(lecturer.jurusan_id) === departmentId
      ),
    [departmentId, lecturers]
  );
  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => String(course.jurusan_id) === departmentId),
    [courses, departmentId]
  );

  async function request(path: string, init: RequestInit = {}) {
    if (!API_URL) throw new Error('VITE_API_URL belum dikonfigurasi.');
    if (!token) throw new Error('Token admin tidak tersedia. Silakan login ulang.');

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(responseError(payload, response.status));
    return payload;
  }

  async function loadClasses() {
    const payload = await request('/academic-classes');
    setClasses(getCollection<AcademicClass>(payload, 'classes'));
  }

  async function loadAcademicData() {
    setLoading(true);
    setDataError('');
    try {
      const payload = await request('/admin/academic-data');
      const body = asRecord(payload);
      const data = asRecord(body.data ?? payload);
      const nextDepartments = getCollection<Department>(data, 'jurusan');
      setDepartments(nextDepartments);
      setLecturers(getCollection<Lecturer>(data, 'dosen'));
      setCourses(getCollection<Course>(data, 'matkul'));
      if (nextDepartments.length) {
        const firstDepartmentId = String(nextDepartments[0].id);
        setDepartmentId((current) => current || firstDepartmentId);
      }

      try {
        await loadClasses();
      } catch (loadError) {
        console.error('Gagal mengambil kelas untuk pembaruan periode:', loadError);
        setDataError(
          loadError instanceof Error
            ? `Data jurusan berhasil dimuat, tetapi daftar kelas gagal dimuat: ${loadError.message}`
            : 'Daftar kelas gagal dimuat.'
        );
      }
    } catch (loadError) {
      console.error('Gagal mengambil data akademik:', loadError);
      setDataError(
        loadError instanceof Error
          ? loadError.message
          : 'Data jurusan, dosen, dan mata kuliah gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAcademicData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // loadAcademicData uses the current bearer token for all admin API requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClassError('');
    setClassNotice('');
    setSavingClass(true);
    try {
      await request('/admin/academic-classes', {
        method: 'POST',
        body: JSON.stringify({
          dosen_id: Number(lecturerId),
          matkul_id: Number(courseId),
          nama_kelas: className.trim(),
          tahun_ajaran: `${yearStart}/${Number(yearStart) + 1}`,
          term,
          hari: day,
          jam_mulai: startTime,
          jam_selesai: endTime,
          ruangan: room.trim(),
        }),
      });
      setClassNotice('Kelas dan jadwal berhasil dibuat.');
      setLecturerId('');
      setCourseId('');
      setClassName('');
      setRoom('');
      await loadClasses();
    } catch (saveError) {
      console.error('Gagal membuat kelas dan jadwal:', saveError);
      setClassError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal membuat kelas dan jadwal.'
      );
    } finally {
      setSavingClass(false);
    }
  }

  async function updateClassOffering(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOfferingError('');
    setOfferingNotice('');
    setSavingOffering(true);
    try {
      await request(
        `/admin/academic-classes/${selectedClassId}/offering`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            tahun_ajaran: `${offeringYearStart}/${Number(offeringYearStart) + 1}`,
            term: offeringTerm,
          }),
        }
      );
      setOfferingNotice('Periode penawaran kelas berhasil diperbarui.');
      await loadClasses();
    } catch (saveError) {
      console.error('Gagal memperbarui periode penawaran kelas:', saveError);
      setOfferingError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal memperbarui periode penawaran kelas.'
      );
    } finally {
      setSavingOffering(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
          Akademik
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          Kelas & Jadwal
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Buat penawaran kelas pada tahun ajaran dan semester aktif, atau perbarui
          periode kelas yang sudah ada.
        </p>
      </div>

      {loading ? (
        <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Memuat data akademik...
        </p>
      ) : (
        <>
          {dataError && (
            <p
              aria-live="polite"
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {dataError}
            </p>
          )}
          <form
            className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={createClass}
          >
            <label className="text-sm font-medium text-slate-700">
              Jurusan
              <select
                className={inputClass}
                onChange={(event) => {
                  setDepartmentId(event.target.value);
                  setLecturerId('');
                  setCourseId('');
                }}
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
              Dosen
              <select
                className={inputClass}
                disabled={!departmentId}
                onChange={(event) => setLecturerId(event.target.value)}
                required
                value={lecturerId}
              >
                <option value="">Pilih dosen</option>
                {filteredLecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.nama}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Mata Kuliah
              <select
                className={inputClass}
                disabled={!departmentId}
                onChange={(event) => setCourseId(event.target.value)}
                required
                value={courseId}
              >
                <option value="">Pilih mata kuliah</option>
                {filteredCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.kode_matkul} - {course.nama_matkul}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Nama Kelas
              <input
                className={inputClass}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="Contoh: IF-A"
                required
                value={className}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Tahun Ajaran
              <input
                className={inputClass}
                max="2100"
                min="2000"
                onChange={(event) => setYearStart(event.target.value)}
                required
                type="number"
                value={yearStart}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Dikirim sebagai {yearStart}/{Number(yearStart) + 1}
              </span>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Semester
              <select
                className={inputClass}
                onChange={(event) =>
                  setTerm(event.target.value as 'ganjil' | 'genap')
                }
                value={term}
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Hari
              <select
                className={inputClass}
                onChange={(event) => setDay(event.target.value)}
                value={day}
              >
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(
                  (item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Jam Mulai
              <input
                className={inputClass}
                onChange={(event) => setStartTime(event.target.value)}
                required
                type="time"
                value={startTime}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Jam Selesai
              <input
                className={inputClass}
                onChange={(event) => setEndTime(event.target.value)}
                required
                type="time"
                value={endTime}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Ruangan
              <input
                className={inputClass}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Contoh: Lab Komputer"
                required
                value={room}
              />
            </label>

            {(classError || classNotice) && (
              <p
                aria-live="polite"
                className={`rounded-lg px-3 py-2 text-sm sm:col-span-2 lg:col-span-3 ${
                  classError
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {classError || classNotice}
              </p>
            )}

            <div className="sm:col-span-2 lg:col-span-3">
              <button
                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  savingClass ||
                  !filteredLecturers.length ||
                  !filteredCourses.length
                }
                type="submit"
              >
                {savingClass ? 'Menyimpan...' : 'Buat Kelas & Jadwal'}
              </button>
            </div>
          </form>

          <div className="my-6 border-t border-slate-200" />

          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Perbarui Periode Penawaran Kelas
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Atur tahun ajaran dan term untuk kelas yang sudah terdaftar, termasuk
              kelas lama.
            </p>
          </div>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            onSubmit={updateClassOffering}
          >
            <label className="text-sm font-medium text-slate-700">
              Kelas
              <select
                className={inputClass}
                onChange={(event) => setSelectedClassId(event.target.value)}
                required
                value={selectedClassId}
              >
                <option value="">Pilih kelas</option>
                {classes.map((academicClass) => (
                  <option key={academicClass.id} value={academicClass.id}>
                    {academicClass.kode_matkul} - {academicClass.nama_matkul} (
                    {academicClass.nama_kelas})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Tahun Ajaran
              <input
                className={inputClass}
                max="2100"
                min="2000"
                onChange={(event) => setOfferingYearStart(event.target.value)}
                required
                type="number"
                value={offeringYearStart}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Semester
              <select
                className={inputClass}
                onChange={(event) =>
                  setOfferingTerm(event.target.value as 'ganjil' | 'genap')
                }
                value={offeringTerm}
              >
                <option value="ganjil">Ganjil</option>
                <option value="genap">Genap</option>
              </select>
            </label>
            <button
              className="h-10 rounded-lg border border-cyan-700 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 disabled:opacity-50"
              disabled={savingOffering || !classes.length}
              type="submit"
            >
              {savingOffering ? 'Memperbarui...' : 'Perbarui Offering'}
            </button>
            {(offeringError || offeringNotice) && (
              <p
                aria-live="polite"
                className={`rounded-lg px-3 py-2 text-sm sm:col-span-2 lg:col-span-4 ${
                  offeringError
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {offeringError || offeringNotice}
              </p>
            )}
            {!classes.length && !dataError && (
              <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-4">
                Belum ada kelas yang dapat diperbarui.
              </p>
            )}
          </form>
        </>
      )}
    </section>
  );
}
