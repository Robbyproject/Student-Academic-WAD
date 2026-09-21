import React, { useState } from 'react';
import type { UserProfile } from '../types/user';

type DataDiriProps = {
  initialData: UserProfile;
};

export const DataDiri: React.FC<DataDiriProps> = ({ initialData }) => {
  const [formData, setFormData] = useState<UserProfile>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Data berhasil disimpan!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-8">

      <div className="w-full md:w-64 space-y-2">
        <button className="w-full text-left px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm cursor-pointer select-none">
          Data Diri
        </button>
        <button className="w-full text-left px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer select-none">
          Ubah Kata Sandi
        </button>
      </div>

      <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">NIM</label>
            <input
              type="text"
              name="nim"
              value={formData.nim}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              No. Telepon <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-600">
                +62
              </span>
              <input
                type="text"
                name="noTelepon"
                value={formData.noTelepon}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Laki-laki"
                  checked={formData.jenisKelamin === 'Laki-laki'}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Laki-laki</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Perempuan"
                  checked={formData.jenisKelamin === 'Perempuan'}
                  onChange={handleChange}
                  className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Perempuan</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm cursor-pointer select-none"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};