import { useMemo, useState } from 'react';
import matkulData from '../../lib/data/matkul.json';

export type Course = (typeof matkulData)[number];

function UserIcon() {
	return (
		<svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path d="M15 19a4 4 0 0 0-8 0m4-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5 8a4 4 0 0 0-3-3.87m1-5.13a3 3 0 0 0 0-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="9" strokeWidth="1.5" />
			<path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
		</svg>
	);
}

function CourseCard({ course, onSelect }: { course: Course; onSelect: (course: Course) => void }) {
	const attendancePercentage = course.attendanceTotal
		? Math.round((course.attendancePresent / course.attendanceTotal) * 100)
		: 0;

	return (
		<button className="flex min-h-44 min-w-0 cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400/50" onClick={() => onSelect(course)} type="button">
			<h2 className="break-words text-sm font-semibold leading-6 text-slate-900">
				{course.code} - {course.name}
			</h2>

			<div className="mt-5 min-h-10 space-y-1 text-[11px] leading-4 text-slate-500">
				<div className="flex items-start gap-1.5">
					<UserIcon />
					<span>{course.lecturer ? `-- ${course.lecturer}` : '-'}</span>
				</div>
				<div className="flex items-start gap-1.5">
					<ClockIcon />
					<div className="min-w-0 break-words">
						{course.schedules.length ? course.schedules.map((schedule) => <p key={schedule}>{schedule}</p>) : '-'}
					</div>
				</div>
			</div>

			<div className="mt-auto rounded-lg bg-cyan-100/80 p-2">
				<div className="h-2 rounded-full bg-white p-0.5">
					<div className="h-full rounded-full bg-cyan-400" style={{ width: `${attendancePercentage}%` }} />
				</div>
				<div className="mt-1 flex justify-between text-[9px] text-slate-500">
					<span>Kehadiran: {course.attendancePresent} dari {course.attendanceTotal} sesi</span>
					<span>{attendancePercentage}%</span>
				</div>
			</div>
		</button>
	);
}

export default function Kelas({ onCourseSelect }: { onCourseSelect: (course: Course) => void }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [semester, setSemester] = useState('2026/2027 Ganjil');

	const filteredCourses = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return matkulData.filter((course) => {
			const matchesSearch = [course.code, course.name, course.lecturer].some((value) =>
				value.toLowerCase().includes(normalizedSearch),
			);
			return matchesSearch && course.semester === semester;
		});
	}, [searchTerm, semester]);

	return (
		<section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-sm font-semibold text-slate-900">
					Kelas Akademik <span className="ml-1 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[9px] font-medium text-cyan-700">{filteredCourses.length}</span>
				</h1>
				<button className="flex items-center gap-1.5 text-[11px] font-medium text-sky-600 transition-colors hover:text-sky-800" type="button">
					<svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path d="M20 11a8.1 8.1 0 0 0-14.8-4.4L4 8m0 0V4m0 4h4M4 13a8.1 8.1 0 0 0 14.8 4.4L20 16m0 0v4m0-4h-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
					</svg>
					Perbarui Data Kehadiran
				</button>
			</div>

			<div className="mt-4 flex flex-col gap-2 sm:flex-row">
				<label className="relative flex-1">
					<span className="sr-only">Cari kelas</span>
					<svg aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="11" cy="11" r="7" strokeWidth="1.5" />
						<path d="m20 20-4-4" strokeLinecap="round" strokeWidth="1.5" />
					</svg>
					<input className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-[11px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari mata kuliah, kode kelas atau nama dosen" value={searchTerm} />
				</label>
				<select aria-label="Pilih semester" className="h-7 max-w-full rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" onChange={(event) => setSemester(event.target.value)} value={semester}>
					<option>2026/2027 Ganjil</option>
				</select>
			</div>

			{filteredCourses.length ? (
				<div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-3">
					{filteredCourses.map((course) => <CourseCard course={course} key={course.id} onSelect={onCourseSelect} />)}
				</div>
			) : (
				<p className="py-10 text-center text-sm text-slate-500">Kelas tidak ditemukan.</p>
			)}
		</section>
	);
}
