import { useState } from 'react';

export default function AttendancePanel() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kehadiran</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Absensi perkuliahan</h2><p className="mt-1 text-sm text-slate-500">Buka sesi untuk mencatat kehadiran kelas.</p></div><button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" onClick={() => setIsOpen((value) => !value)} type="button">{isOpen ? 'Tutup absensi' : 'Buka absensi'}</button></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="border-y border-slate-200 text-xs text-slate-500"><tr><th className="py-3 font-medium">Kelas</th><th className="py-3 font-medium">Jadwal</th><th className="py-3 font-medium">Status</th></tr></thead><tbody><tr className="border-b border-slate-100"><td className="py-3 font-medium text-slate-800">Ilmu Komputer · A</td><td className="py-3 text-slate-600">Hari ini, 09.00</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{isOpen ? 'Dibuka' : 'Belum dibuka'}</span></td></tr></tbody></table></div>
      <p className="mt-3 text-xs text-slate-400">Status sesi saat ini hanya tersimpan di tampilan.</p>
    </section>
  );
}