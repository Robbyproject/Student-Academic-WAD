import { useState, useEffect, type FormEvent } from 'react';

interface Participant {
  id: number;
  kelas_id: number;
  nama_kelas: string;
  kode_matkul: string;
  nama_matkul: string;
  nim: string;
  nama_mahasiswa: string;
  created_at: string;
}

interface AcademicClass {
  id: number;
  nama_kelas: string;
  nama_matkul?: string;
}

interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
}

interface ClassParticipantsPanelProps {
  token: string | null;
}

export default function ClassParticipantsPanel({ token: propToken }: ClassParticipantsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [classList, setClassList] = useState<AcademicClass[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);

  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedMahasiswaId, setSelectedMahasiswaId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const getToken = () => {
    if (propToken) return propToken;
    let token: string | null = null;
    const sessionData = sessionStorage.getItem('academic-auth-session') || localStorage.getItem('academic-auth-session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        token = parsed.token || null;
      } catch (e) {
        token = null;
      }
    }
    if (!token) {
      token = localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return token;
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://backend-student-academic.test/api';

  const fetchData = async () => {
    try {
      const token = getToken();
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

      // Ambil daftar peserta kelas
      const resPart = await fetch(`${apiUrl}/classes/participants`, { headers });
      if (resPart.ok) {
        const data = await resPart.json();
        setParticipants(Array.isArray(data) ? data : data.data || []);
      }

      // Ambil daftar kelas untuk dropdown
      const resClass = await fetch(`${apiUrl}/academic-classes`, { headers });
      if (resClass.ok) {
        const data = await resClass.json();
        setClassList(Array.isArray(data) ? data : data.data || []);
      }

      // Ambil daftar mahasiswa
      const resMhs = await fetch(`${apiUrl}/students`, { headers });
      if (resMhs.ok) {
        const data = await resMhs.json();
        setMahasiswaList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat data peserta kelas', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddParticipant = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedKelasId || !selectedMahasiswaId) {
      setMessage({ text: 'Silakan pilih kelas dan mahasiswa terlebih dahulu!', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/classes/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          kelas_id: selectedKelasId,
          mahasiswa_id: selectedMahasiswaId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal mendaftarkan mahasiswa ke kelas.');

      setMessage({ text: 'Mahasiswa berhasil dimasukkan ke kelas!', type: 'success' });
      setSelectedMahasiswaId('');
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Terjadi kesalahan pada server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    if (!confirm('Apakah kamu yakin ingin mengeluarkan mahasiswa ini dari kelas?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/classes/participants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Gagal menghapus peserta kelas.');

      setMessage({ text: 'Mahasiswa berhasil dikeluarkan dari kelas.', type: 'success' });
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Terjadi kesalahan saat menghapus.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Manajemen Akademik</p>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Kelola Peserta Kelas</h2>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAddParticipant} className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={selectedKelasId}
              onChange={(e) => setSelectedKelasId(e.target.value)}
              required
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 text-slate-700 cursor-pointer"
            >
              <option value="">-- Pilih Kelas --</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nama_kelas} {cls.nama_matkul ? `(${cls.nama_matkul})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Mahasiswa</label>
            <select
              value={selectedMahasiswaId}
              onChange={(e) => setSelectedMahasiswaId(e.target.value)}
              required
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 text-slate-700 cursor-pointer"
            >
              <option value="">-- Pilih Mahasiswa --</option>
              {mahasiswaList.map((mhs) => (
                <option key={mhs.id} value={mhs.id}>
                  {mhs.nim} - {mhs.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Menambahkan...' : 'Masukkan ke Kelas'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-800">Daftar Mahasiswa dalam Kelas</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Mata Kuliah</th>
                <th className="py-3 px-3">NIM</th>
                <th className="py-3 px-3">Nama Mahasiswa</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {participants.length > 0 ? (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{p.nama_kelas}</td>
                    <td className="py-3 px-3 text-slate-600">{p.nama_matkul} ({p.kode_matkul})</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{p.nim}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{p.nama_mahasiswa}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteParticipant(p.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Keluarkan
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-sm">
                    Belum ada data mahasiswa yang terdaftar di dalam kelas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}