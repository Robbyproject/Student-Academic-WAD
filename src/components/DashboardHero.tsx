import type { UserProfile } from '../types/user';

type DashboardHeroProps = {
  user: UserProfile;
  pendingTasks: number;
};

function SparkleIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4zM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}

function ClipboardIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="15" rx="2" width="15" x="4.5" y="5" strokeWidth="1.5" /><path d="M9 5V3h6v2" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function CalendarIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="17" rx="2" width="18" x="3" y="4" strokeWidth="1.5" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

export default function DashboardHero({ user, pendingTasks }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-6 text-white shadow-lg shadow-indigo-500/15 sm:px-7 sm:py-8">
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold text-indigo-50 ring-1 ring-white/20"><SparkleIcon /> Semester 2026/2027 Ganjil</span>
        <h1 className="mt-4 break-words text-2xl font-bold tracking-tight sm:text-3xl">Halo, {user.nama.split(' ')[0]}!</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-50">Pantau aktivitas akademikmu dengan lebih mudah. Kamu memiliki <strong>{pendingTasks} tugas</strong> yang perlu diselesaikan.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition-transform hover:-translate-y-0.5" type="button"><ClipboardIcon /> Lihat Tugas Terdekat</button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20" type="button"><CalendarIcon /> Jadwal Hari Ini</button>
        </div>
      </div>
      <div aria-hidden="true" className="absolute -right-8 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-cyan-200/20 blur-2xl" />
    </section>
  );
}