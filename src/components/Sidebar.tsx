import type { ActivePage } from '../App';

type SidebarProps = {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
};

function GridIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="7" rx="1" width="7" x="3" y="3" strokeWidth="1.5" /><rect height="7" rx="1" width="7" x="14" y="3" strokeWidth="1.5" /><rect height="7" rx="1" width="7" x="3" y="14" strokeWidth="1.5" /><rect height="7" rx="1" width="7" x="14" y="14" strokeWidth="1.5" /></svg>;
}

function UserIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3" strokeWidth="1.5" /><path d="M5 21a7 7 0 0 1 14 0" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function BookIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}

function ClipboardIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="15" rx="2" width="15" x="4.5" y="5" strokeWidth="1.5" /><path d="M9 5V3h6v2M8 12h8M8 16h5" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

function CalendarIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect height="17" rx="2" width="18" x="3" y="4" strokeWidth="1.5" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

const menuItems = [
  { label: 'Beranda', page: 'dashboard' as const, icon: GridIcon },
  { label: 'Data Diri', page: 'profile' as const, icon: UserIcon },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full min-w-0 flex-col overflow-hidden border-r border-slate-200 bg-white p-3 shadow-sm lg:p-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu Utama</p>
        <nav aria-label="Navigasi utama" className="space-y-1">
          {menuItems.map(({ label, page, icon: Icon }) => (
            <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${activePage === page ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`} key={page} onClick={() => onNavigate(page)} type="button">
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="my-4 h-px bg-slate-100" />
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Akademik</p>
        <div className="space-y-1 text-sm text-slate-500">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><BookIcon /><span>Mata Kuliah</span></div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><ClipboardIcon /><span>Tugas & Deadline</span></div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5"><CalendarIcon /><span>Jadwal Kuliah</span></div>
        </div>
      <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4">
        <p className="text-xs font-semibold text-indigo-800">Ruang Akademik</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">Kelola kelas, tugas, jadwal, dan data akademik dari satu tempat.</p>
      </div>

      <div className="mt-auto border-t border-slate-200 pt-4 text-xs text-slate-500">
        <div className="flex items-center justify-between font-medium text-slate-700">
          <span>IPK Sementara</span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-emerald-600">3.82</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Total SKS Lulus</span>
          <span>88 / 144 SKS</span>
        </div>
      </div>
    </aside>
  );
}