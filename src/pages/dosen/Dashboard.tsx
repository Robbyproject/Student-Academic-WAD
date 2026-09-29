import type { UserProfile } from '../../types/user';
import AttendancePanel from './sections/AttendancePanel';
import TaskUploadPanel from './sections/TaskUploadPanel';

type LecturerDashboardProps = { user: UserProfile; onLogout: () => void };

export default function LecturerDashboard({ user, onLogout }: LecturerDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:px-8"><div><p className="text-sm font-bold text-slate-900">Student Academic</p><p className="text-xs text-slate-500">Portal dosen</p></div><div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-semibold">{user.nama}</p><p className="text-xs text-slate-500">Dosen</p></div><button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50" onClick={onLogout} type="button">Keluar</button></div></header>
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Ruang pengajar</p><h1 className="mt-1 text-2xl font-semibold">Halo, {user.nama.split(' ')[0]}</h1></div><p className="text-sm text-slate-500">Semester 2026/2027 Ganjil</p></div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Kelas aktif</p><p className="mt-2 text-2xl font-semibold">4</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Tugas dipublikasikan</p><p className="mt-2 text-2xl font-semibold">12</p></div><div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Sesi hari ini</p><p className="mt-2 text-2xl font-semibold">2</p></div></div>
        <div className="grid gap-5"><AttendancePanel /><TaskUploadPanel /></div>
      </div>
    </main>
  );
}