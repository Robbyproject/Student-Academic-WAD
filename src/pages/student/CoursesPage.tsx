import { useEffect, useMemo, useState } from 'react';
import {
  studentRequest,
  unwrapList,
  unwrapRecord,
} from '../../api/student';

type Course = {
  id: number;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
};

type ClassSection = {
  id: number;
  matkul_id: number;
  nama_kelas: string;
  nama_matkul?: string;
  kode_matkul?: string;
  nama_dosen?: string;
  schedules?: Array<Record<string, unknown>> | string[];
  jadwal?: Array<Record<string, unknown>> | string[];
};

type PackageInfo = {
  id?: number;
  name?: string;
  semester?: number;
  matkul_ids?: number[];
};

type CoursesPageProps = {
  token: string | null;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function numberId(...values: unknown[]): number {
  for (const value of values) {
    const id = Number(value);
    if (Number.isInteger(id) && id > 0) return id;
  }
  return 0;
}

function courseFrom(value: unknown): Course | null {
  const item = record(value);
  const id = numberId(item.id, item.matkul_id, item.course_id);
  if (!id) return null;
  return {
    id,
    kode_matkul: String(item.kode_matkul ?? item.code ?? ''),
    nama_matkul: String(item.nama_matkul ?? item.name ?? ''),
    sks: Number(item.sks ?? item.credits ?? 0),
  };
}

function sectionFrom(value: unknown, courseId = 0): ClassSection | null {
  const item = record(value);
  const id = numberId(item.id, item.kelas_id, item.class_id);
  const nestedCourse = record(item.matkul ?? item.course);
  const resolvedCourseId = numberId(
    item.matkul_id,
    item.course_id,
    nestedCourse.id,
    courseId
  );
  if (!id || !resolvedCourseId) return null;
  return {
    id,
    matkul_id: resolvedCourseId,
    nama_kelas: String(item.nama_kelas ?? item.class_name ?? item.name ?? ''),
    nama_matkul: String(item.nama_matkul ?? nestedCourse.nama_matkul ?? ''),
    kode_matkul: String(item.kode_matkul ?? nestedCourse.kode_matkul ?? ''),
    nama_dosen: String(item.nama_dosen ?? record(item.dosen).nama ?? ''),
    schedules: Array.isArray(item.schedules) ? item.schedules as ClassSection['schedules'] : undefined,
    jadwal: Array.isArray(item.jadwal) ? item.jadwal as ClassSection['jadwal'] : undefined,
  };
}

function scheduleLabel(section: ClassSection): string {
  const schedule = section.schedules?.[0] ?? section.jadwal?.[0];
  if (typeof schedule === 'string') return schedule;
  if (!schedule) return '';
  const day = String(schedule.hari ?? schedule.day ?? '');
  const start = String(schedule.jam_mulai ?? schedule.start_time ?? '');
  const end = String(schedule.jam_selesai ?? schedule.end_time ?? '');
  const room = String(schedule.ruangan ?? schedule.room ?? '');
  return [day, [start, end].filter(Boolean).join('–'), room]
    .filter(Boolean)
    .join(' · ');
}

function extractSelectedIds(payload: unknown): number[] {
  const data = unwrapRecord(payload);
  const krs = record(data.krs);
  const ids = data.kelas_ids ?? krs.kelas_ids;
  if (Array.isArray(ids)) return ids.map(Number).filter(Number.isInteger);
  const selected = data.kelas ?? krs.kelas ?? data.classes ?? krs.classes;
  return Array.isArray(selected)
    ? selected.map((item) => numberId(record(item).id, item)).filter(Boolean)
    : [];
}

export default function CoursesPage({ token }: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [selectedByCourse, setSelectedByCourse] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);

  async function loadCourses() {
    setLoading(true);
    setError('');
    try {
      const [optionsPayload, currentPayload, catalogPayload] = await Promise.all([
        studentRequest<unknown>('/krs/options', token),
        studentRequest<unknown>('/krs', token),
        studentRequest<unknown>('/matkul', token),
      ]);

      const options = unwrapRecord(optionsPayload);
      const packageRaw = record(
        options.required_package ??
          options.package ??
          options.paket_kurikulum ??
          options.paket
      );
      const packageCoursesRaw = unwrapList<unknown>(
        packageRaw,
        'matkul',
        'mata_kuliah',
        'courses',
        'required_courses'
      );
      const requiredCoursesRaw = unwrapList<unknown>(
        options,
        'required_courses',
        'courses',
        'matkul_wajib',
        'mata_kuliah_wajib'
      );
      const packageIds = Array.isArray(packageRaw.matkul_ids)
        ? packageRaw.matkul_ids.map(Number)
        : [];
      const catalog = unwrapList<unknown>(
        catalogPayload,
        'matkul',
        'courses',
        'data'
      )
        .map(courseFrom)
        .filter((course): course is Course => course !== null);
      const embeddedCourses = [...packageCoursesRaw, ...requiredCoursesRaw]
        .map(courseFrom)
        .filter((course): course is Course => course !== null);
      const requiredCourses = embeddedCourses.length
        ? embeddedCourses
        : catalog.filter((course) => packageIds.includes(course.id));

      const rawSections = unwrapList<unknown>(
        options,
        'available_classes',
        'available_sections',
        'kelas_tersedia',
        'sections',
        'classes'
      );
      const availableSections: ClassSection[] = [];
      for (const rawSection of rawSections) {
        const item = record(rawSection);
        const impliedCourse = numberId(item.matkul_id, item.course_id);
        const nested = [
          ...unwrapList<unknown>(item, 'available_classes', 'sections', 'kelas'),
          ...unwrapList<unknown>(item, 'classes', 'class_sections'),
        ];
        if (nested.length) {
          for (const rawNested of nested) {
            const section = sectionFrom(rawNested, impliedCourse);
            if (section) availableSections.push(section);
          }
        } else {
          const section = sectionFrom(rawSection);
          if (section) availableSections.push(section);
        }
      }

      const period = record(options.period);
      setRegistrationOpen(
        typeof period.registration_open === 'boolean'
          ? period.registration_open
          : typeof options.registration_open === 'boolean'
            ? options.registration_open
            : null
      );
      setPackageInfo({
        id: numberId(packageRaw.id) || undefined,
        name: String(packageRaw.name ?? packageRaw.nama_paket ?? ''),
        semester: Number(packageRaw.semester) || undefined,
        matkul_ids: packageIds,
      });
      setCourses(requiredCourses);
      setSections(availableSections);

      const selectedIds = extractSelectedIds(currentPayload);
      const selectedById = new Map(
        availableSections.map((section) => [section.id, section.matkul_id])
      );
      const currentSelections: Record<number, number> = {};
      for (const sectionId of selectedIds) {
        const courseId = selectedById.get(sectionId);
        if (courseId) currentSelections[courseId] = sectionId;
      }
      setSelectedByCourse(currentSelections);

      if (!requiredCourses.length) {
        setError(
          'API KRS tidak mengembalikan mata kuliah wajib pada paket. Periksa respons GET /krs/options.'
        );
      }
    } catch (loadError) {
      console.error('Gagal memuat mata kuliah dan pilihan KRS:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Gagal memuat data mata kuliah.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCourses();
    }, 0);
    return () => window.clearTimeout(timeoutId);
    // Load data whenever the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selectedClassIds = useMemo(
    () => courses.map((course) => selectedByCourse[course.id]).filter(Boolean),
    [courses, selectedByCourse]
  );

  async function submitKrs() {
    setSaving(true);
    setError('');
    setNotice('');
    if (courses.some((course) => !selectedByCourse[course.id])) {
      setError('Pilih satu kelas untuk setiap mata kuliah wajib sebelum mengirim KRS.');
      setSaving(false);
      return;
    }
    try {
      const response = await studentRequest<unknown>('/krs', token, {
        method: 'PUT',
        body: JSON.stringify({ kelas_ids: selectedClassIds }),
      });
      const body = unwrapRecord(response);
      setNotice(
        String(body.message ?? 'KRS berhasil dikirim dan disetujui.')
      );
      await loadCourses();
    } catch (submitError) {
      console.error('Gagal mengirim KRS:', submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Gagal mengirim KRS.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
          Akademik
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Mata Kuliah</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lihat paket semester dan pilih kelas untuk mengisi atau memperbarui KRS.
        </p>
      </div>

      {packageInfo && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-cyan-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-cyan-900">
              {packageInfo.name || 'Paket kurikulum'}
            </p>
            <p className="text-xs text-cyan-800">
              {packageInfo.semester
                ? `Semester ${packageInfo.semester}`
                : 'Semester kurikulum'}
            </p>
          </div>
          {registrationOpen !== null && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                registrationOpen
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {registrationOpen ? 'KRS dibuka' : 'KRS ditutup'}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Memuat mata kuliah dan pilihan kelas...
        </p>
      ) : courses.length ? (
        <div className="space-y-4">
          {courses.map((course) => {
            const courseSections = sections.filter(
              (section) => section.matkul_id === course.id
            );
            return (
              <article
                className="rounded-lg border border-slate-200 p-4"
                key={course.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {course.kode_matkul} · {course.nama_matkul}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">{course.sks} SKS</p>
                  </div>
                  {selectedByCourse[course.id] && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Dipilih
                    </span>
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {courseSections.map((section) => (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm hover:border-cyan-400"
                      key={section.id}
                    >
                      <input
                        checked={selectedByCourse[course.id] === section.id}
                        disabled={registrationOpen === false || saving}
                        name={`course-${course.id}`}
                        onChange={() =>
                          setSelectedByCourse((current) => ({
                            ...current,
                            [course.id]: section.id,
                          }))
                        }
                        type="radio"
                      />
                      <span>
                        <span className="font-medium text-slate-800">
                          Kelas {section.nama_kelas || section.id}
                        </span>
                        {section.nama_dosen && (
                          <span className="mt-1 block text-xs text-slate-600">
                            {section.nama_dosen}
                          </span>
                        )}
                        {scheduleLabel(section) && (
                          <span className="mt-1 block text-xs text-slate-500">
                            {scheduleLabel(section)}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                  {!courseSections.length && (
                    <p className="text-sm text-amber-700">
                      Belum ada kelas tersedia untuk mata kuliah ini.
                    </p>
                  )}
                </div>
              </article>
            );
          })}

          {registrationOpen === false && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Pendaftaran KRS sedang ditutup. Pilihan hanya dapat dilihat.
            </p>
          )}
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
          <button
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              saving ||
              registrationOpen === false ||
              courses.some(
                (course) =>
                  !selectedByCourse[course.id] ||
                  !sections.some(
                    (section) =>
                      section.id === selectedByCourse[course.id] &&
                      section.matkul_id === course.id
                  )
              )
            }
            onClick={() => void submitKrs()}
            type="button"
          >
            {saving ? 'Mengirim KRS...' : 'Simpan KRS'}
          </button>
        </div>
      ) : (
        !error && (
          <p className="py-8 text-center text-sm text-slate-500">
            Belum ada paket mata kuliah untuk periode akademik Anda.
          </p>
        )
      )}

      {error && !courses.length && (
        <p
          aria-live="polite"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <button
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        disabled={loading || saving}
        onClick={() => void loadCourses()}
        type="button"
      >
        Muat Ulang
      </button>
    </section>
  );
}
