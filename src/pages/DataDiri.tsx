import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../types/user';
import { changePassword } from '../api/auth';
import { studentRequest, unwrapRecord } from '../api/student';

type DataDiriProps = {
  initialData: UserProfile;
  token: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getText(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

export const DataDiri: React.FC<DataDiriProps> = ({ initialData, token }) => {
  // Ambil instruksi tab dari sessionStorage yang dikirim oleh Navbar
  const savedTab = (sessionStorage.getItem('profile_tab') as 'data-diri' | 'ubah-sandi') || 'data-diri';
  const [activeTab, setActiveTab] = useState<'data-diri' | 'ubah-sandi'>(savedTab);

  // State untuk form Data Diri
  const [formData, setFormData] = useState<UserProfile>(initialData);
  const [noTelepon, setNoTelepon] = useState(initialData.noTelepon);
  const [jenisKelamin, setJenisKelamin] = useState<
    'Laki-laki' | 'Perempuan' | ''
  >(initialData.jenisKelamin ?? '');
  const [angkatan, setAngkatan] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // State untuk form Ubah Kata Sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileMessage(null);
      try {
        const payload = await studentRequest<unknown>(
          '/mahasiswa/profile',
          token
        );
        const response = unwrapRecord(payload);
        const profile = unwrapRecord(
          response.mahasiswa ?? response.profile ?? response
        );
        const account = asRecord(profile.user);
        const department = asRecord(profile.jurusan);
        const gender = getText(profile, 'jenis_kelamin');

        if (active) {
          setFormData((current) => ({
            ...current,
            nama:
              getText(profile, 'nama') ||
              getText(account, 'nama') ||
              getText(account, 'name') ||
              current.nama,
            nim: getText(profile, 'nim') || current.nim,
            email:
              getText(profile, 'email') ||
              getText(account, 'email') ||
              current.email,
            prodi:
              getText(profile, 'prodi') ||
              getText(profile, 'program_studi') ||
              getText(profile, 'nama_jurusan') ||
              getText(department, 'nama_jurusan') ||
              current.prodi,
          }));
          setNoTelepon(getText(profile, 'no_telepon'));
          setJenisKelamin(
            gender === 'Laki-laki' || gender === 'Perempuan' ? gender : ''
          );
          setAngkatan(getText(profile, 'angkatan'));
        }
      } catch (error) {
        console.error('Gagal memuat profil mahasiswa:', error);
        if (active) {
          setProfileMessage({
            text:
              error instanceof Error
                ? error.message
                : 'Gagal memuat profil mahasiswa.',
            type: 'error',
          });
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    };
    const timeoutId = window.setTimeout(() => void loadProfile(), 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [token]);

  const handleSubmitDataDiri = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await studentRequest<unknown>('/mahasiswa/profile', token, {
        method: 'PUT',
        body: JSON.stringify({
          no_telepon: noTelepon.trim(),
          jenis_kelamin: jenisKelamin,
        }),
      });
      setProfileMessage({
        text: 'Data diri berhasil disimpan.',
        type: 'success',
      });
    } catch (error) {
      console.error('Gagal menyimpan profil mahasiswa:', error);
      setProfileMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Gagal menyimpan data diri.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Konfirmasi kata sandi baru tidak cocok!', type: 'error' });
      return;
    }

    setLoading(true);

    // Ambil token dari sessionStorage (academic-auth-session) atau fallback ke localStorage
    let token: string | null = null;
    const sessionData = sessionStorage.getItem('academic-auth-session') || localStorage.getItem('academic-auth-session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        token = parsed.token || null;
      } catch {
        token = null;
      }
    }
    if (!token) {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    try {
      const res = await changePassword(
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
        token
      );

      setMessage({ text: res.message, type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : 'Gagal memperbarui kata sandi.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Menu Samping */}
      <div className="w-full md:w-64 space-y-2">
        <button
          onClick={() => {
            setActiveTab('data-diri');
            sessionStorage.setItem('profile_tab', 'data-diri');
          }}
          className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition cursor-pointer select-none ${
            activeTab === 'data-diri'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Data Diri
        </button>
        <button
          onClick={() => {
            setActiveTab('ubah-sandi');
            sessionStorage.setItem('profile_tab', 'ubah-sandi');
            setMessage(null);
          }}
          className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition cursor-pointer select-none ${
            activeTab === 'ubah-sandi'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Ubah Kata Sandi
        </button>
      </div>

      {/* Konten Utama di Sebelah Kanan */}
      <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {activeTab === 'data-diri' ? (
          /* TAMPILAN FORM DATA DIRI */
          <div>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {profileMessage && (
              <div
                aria-live="polite"
                className={`p-3 rounded-xl text-sm mb-4 font-medium ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitDataDiri} className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  readOnly
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Jurusan
                </label>
                <input
                  type="text"
                  value={formData.prodi}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-lg text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Angkatan
                </label>
                <input
                  type="text"
                  value={angkatan}
                  readOnly
                  className="w-full px-3 py-2 bg-slate-100 border border-gray-200 rounded-lg text-sm text-gray-500"
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
                <input
                  type="tel"
                  name="noTelepon"
                  value={noTelepon}
                  onChange={(event) => setNoTelepon(event.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="08xxxxxxxxxx"
                />
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
                      checked={jenisKelamin === 'Laki-laki'}
                      onChange={() => setJenisKelamin('Laki-laki')}
                      required
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Perempuan"
                      checked={jenisKelamin === 'Perempuan'}
                      onChange={() => setJenisKelamin('Perempuan')}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProfile || savingProfile}
                className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer select-none"
              >
                {loadingProfile
                  ? 'Memuat profil...'
                  : savingProfile
                    ? 'Menyimpan...'
                    : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        ) : (
          /* TAMPILAN FORM UBAH KATA SANDI */
          <div>
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Ubah Kata Sandi</h2>
              <p className="text-sm text-slate-500 mt-1">
                Perbarui kata sandi akun akademikmu secara berkala agar tetap aman.
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-sm mb-4 font-medium ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmitPassword} className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kata Sandi Saat Ini <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="Masukkan sandi lama"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="Ulangi sandi baru"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer select-none"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};