import React, { useState } from 'react';
import type { UserProfile } from '../types/user';

type NavbarProps = {
  user: UserProfile;
  activePage: 'dashboard' | 'profile';
  onNavigate: (page: 'dashboard' | 'profile') => void;
};

export const Navbar: React.FC<NavbarProps> = ({ user, activePage, onNavigate }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <nav className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div
        className="flex shrink-0 items-center space-x-3 cursor-pointer select-none"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
          R
        </div>
        <div className="hidden sm:block">
          <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">Student Academic</span>
          <span className="-mt-1 block text-[9px] font-semibold uppercase tracking-wider text-slate-400">Academic Portal</span>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 md:flex">
        <label className="relative w-full max-w-md">
          <span className="sr-only">Cari akademik</span>
          <svg aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" strokeWidth="1.5" /><path d="m20 20-4-4" strokeLinecap="round" strokeWidth="1.5" /></svg>
          <input className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" placeholder="Cari mata kuliah, materi, atau tugas..." />
        </label>
        <select aria-label="Semester aktif" className="h-9 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[11px] font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
          <option>2026/2027 Ganjil</option>
          <option>2025/2026 Genap</option>
        </select>
      </div>

      <div className="relative flex shrink-0 items-center space-x-3">

        <button className="text-slate-500 hover:text-slate-700 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>


        <div 
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            AR
          </div>

          <div className="text-left">
            <p className="text-sm font-bold text-gray-900 leading-tight">{user.nama}</p>
            <p className="text-xs text-gray-500">{user.nim} - {user.prodi}</p>
          </div>

          <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
            <button 
              onClick={() => {
                onNavigate('profile');
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                activePage === 'profile'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Data Diri
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer">
              Ubah Kata Sandi
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg mt-1 border-t border-slate-100 cursor-pointer">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};