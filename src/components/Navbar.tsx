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
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div 
        className="flex items-center space-x-3 cursor-pointer select-none"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="w-9 h-9 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
          Logo
        </div>
        <span className="text-xl font-bold text-gray-800">Akademik</span>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-full">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`px-5 py-1.5 rounded-full font-medium text-sm transition-all cursor-pointer select-none ${
            activePage === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dashboard
        </button>
      </div>

      <div className="flex items-center space-x-4 relative">

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