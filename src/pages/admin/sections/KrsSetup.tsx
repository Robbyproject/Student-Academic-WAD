import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Department = {
  id: number;
  kode_jurusan: string;
  nama_jurusan: string;
};

type Course = {
  id: number;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  jurusan_id: number;
};

type AcademicPeriod = {
  id: number;
  academic_year_start: number;
  academic_year?: string;
  term: 'ganjil' | 'genap';
  is_active: boolean;
  registration_open: boolean;
};

type CoursePackage = {
  id: number;
  jurusan_id: number;
  semester: number;
  name: string;
  matkul_ids?: number[];
  matkul?: Array<{ id: number }>;
  mata_kuliah?: Array<{ id: number }>;
  courses?: Array<{ id: number }>;
};

type Props = {
  token: string | null;
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
const cardClass = 'rounded-xl border border-slate-200 bg-white p-5';
const inputClass =
  'mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600';

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

async function readResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function apiError(payload: unknown, status: number): string {
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

export default function KrsSetup({ token }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('3');
  const [newCourseDepartmentId, setNewCourseDepartmentId] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [courseNotice, setCourseNotice] = useState('');

  const [yearStart, setYearStart] = useState('2026');
  const [periodTerm, setPeriodTerm] = useState<'ganjil' | 'genap'>('ganjil');
  const [periodIsActive, setPeriodIsActive] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(false);

  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('1');
  const [packageName, setPackageName] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);

  const coursesForDepartment = useMemo(
    () => courses.filter((course) => String(course.jurusan_id) === departmentId),
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
    const payload = await readResponse(response);
    if (!response.ok) throw new Error(apiError(payload, response.status));
    return payload;
  }

  async function loadSetup() {
    setLoading(true);
    setError('');
    try {
      const [academicPayload, periodPayload, packagePayload] = await Promise.all([
        request('/admin/academic-data'),
        request('/admin/krs/periods'),
        request('/admin/krs/packages'),
      ]);

      const academic = asRecord(academicPayload);
      const academicData = asRecord(academic.data ?? academicPayload);
      setDepartments(getCollection<Department>(academicData, 'jurusan'));
      setCourses(getCollection<Course>(academicData, 'matkul'));
      if (!newCourseDepartmentId) {
        const firstDepartment = getCollection<Department>(academicData, 'jurusan')[0];
        if (firstDepartment) {
          setNewCourseDepartmentId(String(firstDepartment.id));
        }
      }
      setPeriods(getCollection<AcademicPeriod>(periodPayload, 'periods'));
      setPackages(getCollection<CoursePackage>(packagePayload, 'packages'));
    } catch (loadError) {
      console.error('Gagal memuat pengaturan KRS:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Gagal memuat pengaturan KRS.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSetup();
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // loadSetup only depends on the token passed to this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCourseError('');
    setCourseNotice('');

    if (!newCourseDepartmentId) {
      setCourseError('Pilih jurusan untuk mata kuliah.');
      return;
    }

    setSavingCourse(true);
    try {
      await request('/admin/matkul', {
        method: 'POST',
        body: JSON.stringify({
          kode_matkul: newCourseCode.trim().toUpperCase(),
          nama_matkul: newCourseName.trim(),
          sks: Number(newCourseCredits),
          jurusan_id: Number(newCourseDepartmentId),
        }),
      });

      setCourseNotice('Mata kuliah berhasil dibuat.');
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseCredits('3');
      try {
        const academicPayload = await request('/admin/academic-data');
        const academic = asRecord(academicPayload);
        const academicData = asRecord(academic.data ?? academicPayload);
        setCourses(getCollection<Course>(academicData, 'matkul'));
      } catch (refreshError) {
        console.error('Mata kuliah tersimpan, tetapi daftar gagal diperbarui:', refreshError);
        setCourseNotice(
          'Mata kuliah berhasil dibuat, tetapi daftar belum dapat diperbarui. Muat ulang halaman untuk mengambil data terbaru.'
        );
      }
    } catch (saveError) {
      console.error('Gagal membuat mata kuliah:', saveError);
      setCourseError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal membuat mata kuliah.'
      );
    } finally {
      setSavingCourse(false);
    }
  }

  async function createPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await request('/admin/krs/periods', {
        method: 'POST',
        body: JSON.stringify({
          academic_year_start: Number(yearStart),
          term: periodTerm,
          is_active: periodIsActive,
          registration_open: registrationOpen,
        }),
      });
      setNotice('Periode akademik berhasil dibuat.');
      await loadSetup();
    } catch (saveError) {
      console.error('Gagal membuat periode akademik:', saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal membuat periode akademik.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegistration(period: AcademicPeriod) {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await request(`/admin/krs/periods/${period.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          registration_open: !period.registration_open,
        }),
      });
      setNotice('Status pendaftaran KRS berhasil diperbarui.');
      await loadSetup();
    } catch (saveError) {
      console.error('Gagal memperbarui periode KRS:', saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal memperbarui periode KRS.'
      );
    } finally {
      setSaving(false);
    }
  }

  function resetPackageForm() {
    setEditingPackageId(null);
    setDepartmentId('');
    setSemester('1');
    setPackageName('');
    setSelectedCourseIds([]);
  }

  function editPackage(coursePackage: CoursePackage) {
    setEditingPackageId(coursePackage.id);
    setDepartmentId(String(coursePackage.jurusan_id));
    setSemester(String(coursePackage.semester));
    setPackageName(coursePackage.name);
    setSelectedCourseIds(
      coursePackage.matkul_ids ??
        coursePackage.matkul?.map((course) => course.id) ??
        coursePackage.mata_kuliah?.map((course) => course.id) ??
        coursePackage.courses?.map((course) => course.id) ??
        []
    );
    setError('');
    setNotice('');
  }

  async function savePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!selectedCourseIds.length) {
      setError('Pilih minimal satu mata kuliah untuk paket semester.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        jurusan_id: Number(departmentId),
        semester: Number(semester),
        name: packageName.trim(),
        matkul_ids: selectedCourseIds,
      };
      const path =
        editingPackageId === null
          ? '/admin/krs/packages'
          : `/admin/krs/packages/${editingPackageId}`;
      await request(path, {
        method: editingPackageId === null ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      });
      setNotice(
        editingPackageId === null
          ? 'Paket kurikulum berhasil dibuat.'
          : 'Paket kurikulum berhasil diperbarui.'
      );
      resetPackageForm();
      await loadSetup();
    } catch (saveError) {
      console.error('Gagal menyimpan paket kurikulum:', saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Gagal menyimpan paket kurikulum.'
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleCourse(courseId: number) {
    setSelectedCourseIds((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId]
    );
  }

  return (
    <div className="space-y-5">
      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
            Akademik
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Tambah Mata Kuliah
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Buat mata kuliah dan kaitkan dengan jurusan dari data backend.
          </p>
        </div>
        {loading ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            Memuat data jurusan...
          </p>
        ) : (
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
            onSubmit={createCourse}
          >
            <label className="text-sm font-medium text-slate-700">
              Kode Mata Kuliah
              <input
                className={inputClass}
                onChange={(event) => setNewCourseCode(event.target.value)}
                placeholder="Contoh: IF201"
                required
                value={newCourseCode}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Nama Mata Kuliah
              <input
                className={inputClass}
                onChange={(event) => setNewCourseName(event.target.value)}
                placeholder="Contoh: Struktur Data"
                required
                value={newCourseName}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              SKS
              <input
                className={inputClass}
                max="6"
                min="1"
                onChange={(event) => setNewCourseCredits(event.target.value)}
                required
                type="number"
                value={newCourseCredits}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Jurusan
              <select
                className={inputClass}
                onChange={(event) =>
                  setNewCourseDepartmentId(event.target.value)
                }
                required
                value={newCourseDepartmentId}
              >
                <option value="">Pilih jurusan</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.kode_jurusan} - {department.nama_jurusan}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={savingCourse || !departments.length}
              type="submit"
            >
              {savingCourse ? 'Menyimpan...' : 'Tambah Mata Kuliah'}
            </button>
            {(courseError || courseNotice) && (
              <p
                aria-live="polite"
                className={`rounded-lg px-3 py-2 text-sm sm:col-span-2 lg:col-span-5 ${
                  courseError
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {courseError || courseNotice}
              </p>
            )}
          </form>
        )}
      </section>

      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
            KRS
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Periode Akademik & Pendaftaran
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Atur tahun ajaran, semester ganjil/genap, periode aktif, dan buka/tutup pendaftaran KRS.
          </p>
        </div>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
          onSubmit={createPeriod}
        >
          <label className="text-sm font-medium text-slate-700">
            Tahun mulai
            <input
              className={inputClass}
              max="2100"
              min="2000"
              onChange={(event) => setYearStart(event.target.value)}
              required
              type="number"
              value={yearStart}
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Semester
            <select
              className={inputClass}
              onChange={(event) =>
                setPeriodTerm(event.target.value as 'ganjil' | 'genap')
              }
              value={periodTerm}
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
            </select>
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-700">
            <input
              checked={periodIsActive}
              onChange={(event) => setPeriodIsActive(event.target.checked)}
              type="checkbox"
            />
            Jadikan periode aktif
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm text-slate-700">
            <input
              checked={registrationOpen}
              onChange={(event) => setRegistrationOpen(event.target.checked)}
              type="checkbox"
            />
            Buka pendaftaran KRS
          </label>
          <button
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            disabled={saving || loading}
            type="submit"
          >
            Buat Periode
          </button>
        </form>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-y border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 font-medium">Tahun Ajaran</th>
                <th className="py-3 font-medium">Term</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Pendaftaran</th>
                <th className="py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr className="border-b border-slate-100" key={period.id}>
                  <td className="py-3 font-medium">
                    {period.academic_year ??
                      `${period.academic_year_start}/${period.academic_year_start + 1}`}
                  </td>
                  <td className="py-3 capitalize text-slate-600">{period.term}</td>
                  <td className="py-3 text-slate-600">
                    {period.is_active ? 'Aktif' : 'Tidak aktif'}
                  </td>
                  <td className="py-3 text-slate-600">
                    {period.registration_open ? 'Dibuka' : 'Ditutup'}
                  </td>
                  <td className="py-3">
                    <button
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                      disabled={saving}
                      onClick={() => void toggleRegistration(period)}
                      type="button"
                    >
                      {period.registration_open ? 'Tutup' : 'Buka'} KRS
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && periods.length === 0 && (
                <tr>
                  <td className="py-5 text-slate-500" colSpan={5}>
                    Belum ada periode akademik.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={cardClass}>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
            Kurikulum
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Paket Kurikulum KRS
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih jurusan, semester 1–8, nama paket, dan mata kuliah wajib.
          </p>
        </div>
        <form className="space-y-4" onSubmit={savePackage}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Jurusan
              <select
                className={inputClass}
                onChange={(event) => {
                  setDepartmentId(event.target.value);
                  setSelectedCourseIds([]);
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
              Semester
              <select
                className={inputClass}
                onChange={(event) => setSemester(event.target.value)}
                value={semester}
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Semester {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Nama Paket
              <input
                className={inputClass}
                onChange={(event) => setPackageName(event.target.value)}
                placeholder={`Paket Semester ${semester}`}
                required
                value={packageName}
              />
            </label>
          </div>
          <fieldset className="rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-sm font-medium text-slate-700">
              Mata Kuliah Wajib
            </legend>
            {coursesForDepartment.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {coursesForDepartment.map((course) => (
                  <label
                    className="flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700"
                    key={course.id}
                  >
                    <input
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      type="checkbox"
                    />
                    <span>
                      <span className="font-medium">{course.kode_matkul}</span>
                      {' - '}
                      {course.nama_matkul}
                      <span className="block text-xs text-slate-500">
                        {course.sks} SKS
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {departmentId
                  ? 'Belum ada mata kuliah untuk jurusan ini.'
                  : 'Pilih jurusan untuk melihat mata kuliah.'}
              </p>
            )}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              disabled={saving || loading || !coursesForDepartment.length}
              type="submit"
            >
              {editingPackageId === null ? 'Buat Paket' : 'Simpan Perubahan'}
            </button>
            {editingPackageId !== null && (
              <button
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={resetPackageForm}
                type="button"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-y border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 font-medium">Jurusan</th>
                <th className="py-3 font-medium">Semester</th>
                <th className="py-3 font-medium">Paket</th>
                <th className="py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((coursePackage) => (
                <tr className="border-b border-slate-100" key={coursePackage.id}>
                  <td className="py-3 text-slate-600">
                    {departments.find(
                      (department) =>
                        department.id === coursePackage.jurusan_id
                    )?.nama_jurusan ?? `Jurusan ${coursePackage.jurusan_id}`}
                  </td>
                  <td className="py-3 text-slate-600">
                    Semester {coursePackage.semester}
                  </td>
                  <td className="py-3 font-medium">{coursePackage.name}</td>
                  <td className="py-3">
                    <button
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      onClick={() => editPackage(coursePackage)}
                      type="button"
                    >
                      Edit Paket
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && packages.length === 0 && (
                <tr>
                  <td className="py-5 text-slate-500" colSpan={4}>
                    Belum ada paket kurikulum.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(error || notice) && (
        <p
          aria-live="polite"
          className={`rounded-lg px-3 py-2 text-sm ${
            error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {error || notice}
        </p>
      )}
      {loading && (
        <p className="text-sm text-slate-500">Memuat konfigurasi KRS...</p>
      )}
    </div>
  );
}
