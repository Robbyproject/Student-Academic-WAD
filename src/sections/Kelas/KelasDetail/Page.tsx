import { useState } from 'react';
import type { Course } from '../Page';

type KelasDetailProps = {
	course: Course;
	onBack: () => void;
};

function BackIcon() {
	return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function CalendarIcon() {
	return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="5" strokeWidth="1.5" /><path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function BookIcon() {
	return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return <div className="min-w-0"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 break-words text-xs font-medium text-slate-700">{value}</p></div>;
}

export default function KelasDetail({ course, onBack }: KelasDetailProps) {
	const [expandedMeeting, setExpandedMeeting] = useState<number | null>(null);
	const attendancePercentage = course.attendanceTotal
		? Math.round((course.attendancePresent / course.attendanceTotal) * 100)
		: 0;
	const meetingCount = Math.max(1, Math.min(course.attendanceTotal || course.schedules.length, 6));
	const meetings = Array.from({ length: meetingCount }, (_, index) => {
		const schedule = course.schedules[index % Math.max(course.schedules.length, 1)] || 'Jadwal belum ditentukan';
		return {
			id: index + 1,
			schedule,
			status: index < course.attendancePresent ? 'Selesai' : 'Terjadwal',
		};
	});

	return (
		<div className="w-full min-w-0 bg-slate-50 px-3 py-5 sm:px-5 lg:px-6">
			<div className="mb-4">
				<button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-cyan-400 hover:text-cyan-700" onClick={onBack} type="button"><BackIcon /> Kembali ke Kelas</button>
			</div>

			<section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
				<div className="bg-cyan-600 px-5 py-6 text-white sm:px-7">
					<p className="text-xs font-medium text-cyan-100">Kelas: {course.code}</p>
					<h1 className="mt-1 max-w-3xl break-words text-xl font-bold sm:text-2xl">{course.name}</h1>
				</div>
				<div className="grid gap-5 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-7">
					<DetailRow label="Kode Kelas" value={`2026/1/${course.code}`} />
					<DetailRow label="Dosen Pengajar" value={`-- ${course.lecturer}`} />
					<DetailRow label="Jumlah Mahasiswa" value="49 Mahasiswa" />
					<DetailRow label="Periode Akademik" value={course.semester.toUpperCase()} />
				</div>
			</section>

			<section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
					<h2 className="text-sm font-semibold text-slate-800">Presensi</h2>
					<button className="text-xs font-medium text-cyan-600 hover:text-cyan-800" type="button">Perbarui Presensi</button>
				</div>
				<div className="mt-5 grid gap-5 md:grid-cols-[130px_minmax(0,1fr)] md:items-center">
					<div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ background: `conic-gradient(#08a5c4 ${attendancePercentage * 3.6}deg, #e2e8f0 0deg)` }}>
						<div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><span className="text-[10px] text-slate-400">Kehadiran</span><strong className="text-xl text-orange-500">{attendancePercentage}%</strong></div>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{[['Sesi', course.attendanceTotal], ['Hadir', course.attendancePresent], ['Sakit', 0], ['Izin', 0]].map(([label, value]) => <div className="rounded-lg bg-slate-50 px-3 py-4 text-center" key={label}><strong className="block text-base text-slate-800">{value}</strong><span className="text-[10px] text-slate-500">{label}</span></div>)}
					</div>
				</div>
			</section>

			<div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-400 shadow-sm"><svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth="1.5" /><path d="m20 20-4-4" strokeLinecap="round" strokeWidth="1.5" /></svg><span>Cari materi sesi</span></div>

			<section className="mt-4 space-y-3">
				{meetings.map((meeting) => {
					const isExpanded = expandedMeeting === meeting.id;

					return <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" key={meeting.id}>
						<button
							aria-expanded={isExpanded}
							className="flex w-full cursor-pointer items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400"
							onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}
							type="button"
						>
							<h2 className="text-sm font-semibold text-slate-800">Pertemuan {meeting.id}</h2>
							<div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${meeting.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{meeting.status}</span><svg aria-hidden="true" className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg></div>
						</button>
						<div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
							<div className="min-h-0 overflow-hidden">
								<div className="grid gap-4 border-t border-slate-200 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4"><DetailRow label="Jadwal" value={meeting.schedule} /><DetailRow label="Dosen Pengajar" value={`-- ${course.lecturer}`} /><DetailRow label="Materi" value={course.name} /><DetailRow label="Tugas" value={meeting.status === 'Selesai' ? 'Tersedia' : 'Belum tersedia'} /></div>
								<div className="flex flex-wrap gap-2 border-t border-dashed border-slate-200 px-5 py-3"><button className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700" type="button"><CalendarIcon /> Lihat Jadwal</button><button className="inline-flex items-center gap-2 rounded-md border border-cyan-600 px-3 py-2 text-xs font-medium text-cyan-700 hover:bg-cyan-50" type="button"><BookIcon /> Buka Materi</button></div>
							</div>
						</div>
					</article>;
				})}
			</section>
		</div>
	);
}
