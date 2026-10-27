import { useState, useEffect, type FormEvent } from 'react';
import DosenSubmissionList from './DosenSubmissionList';

interface Task {
  id: number;
  kelas_id: number;
  judul: string;
  deskripsi: string;
  deadline: string;
  file_attachment_path?: string;
  created_at?: string;
  submissions_count?: number;
  nama_kelas?: string;
  nama_matkul?: string;
}

interface AcademicClass {
  id: number;
  nama_kelas: string;
  nama_matkul?: string;
  nama_dosen?: string;
}

interface Jurusan {
  id: number;
  kode_jurusan: string;
  nama_jurusan: string;
}

interface TaskUploadPanelProps {
  token: string | null;
}

export default function TaskUploadPanel({ token: propToken }: TaskUploadPanelProps) {
  const [title, setTitle] = useState('');
  const [selectedJurusanId, setSelectedJurusanId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classList, setClassList] = useState<AcademicClass[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const fetchJurusan = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/dosen/departments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setJurusanList(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat daftar jurusan dosen', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/tasks`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat riwayat tugas', error);
    }
  };

  useEffect(() => {
    fetchJurusan();
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchClassesByJurusan = async () => {
      if (!selectedJurusanId) {
        setClassList([]);
        setSelectedKelasId('');
        return;
      }

      try {
        const token = getToken();
        const response = await fetch(`${apiUrl}/dosen/classes-by-jurusan/${selectedJurusanId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClassList(Array.isArray(data) ? data : data.data || []);
        } else {
          setClassList([]);
        }
      } catch (error) {
        console.error('Gagal memuat daftar kelas dosen berdasarkan jurusan', error);
        setClassList([]);
      }
    };

    fetchClassesByJurusan();
  }, [selectedJurusanId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!title) {
      setMessage({ text: 'Nama tugas wajib diisi!', type: 'error' });
      return;
    }

    if (!selectedJurusanId) {
      setMessage({ text: 'Silakan pilih jurusan terlebih dahulu!', type: 'error' });
      return;
    }

    if (!selectedKelasId) {
      setMessage({ text: 'Silakan pilih kelas terlebih dahulu!', type: 'error' });
      return;
    }

    setLoading(true);
    const token = getToken();
    const formData = new FormData();
    formData.append('judul', title);
    formData.append('kelas_id', selectedKelasId);
    formData.append('deskripsi', description || '-');
    if (deadline) formData.append('deadline', deadline);
    if (file) formData.append('file', file);

    let url = `${apiUrl}/tasks`;
    if (editingId) {
      url = `${apiUrl}/tasks/${editingId}`;
      formData.append('_method', 'PUT');
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menyimpan tugas.');

      setMessage({ 
        text: editingId ? `Tugas berhasil diperbarui!` : `Tugas "${title}" berhasil dipublikasikan ke kelas!`, 
        type: 'success' 
      });

      setTitle('');
      setSelectedJurusanId('');
      setSelectedKelasId('');
      setDescription('');
      setDeadline('');
      setFile(null);
      setEditingId(null);
      const fileInput = document.getElementById('task-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchTasks();
    } catch (err: any) {
      setMessage({ text: err.message || 'Terjadi kesalahan pada server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.judul);
    setSelectedKelasId(task.kelas_id ? task.kelas_id.toString() : '');
    setDescription(task.deskripsi || '');
    setDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!taskToDelete) return;

    try {
      const token = getToken();
      const response = await fetch(`${apiUrl}/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal menghapus tugas.');

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToDelete.id));
      setMessage({ text: `Tugas "${taskToDelete.judul}" berhasil dihapus.`, type: 'success' });
      
      if (selectedTask?.id === taskToDelete.id) {
        setSelectedTask(null);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Terjadi kesalahan saat menghapus.', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Materi Kelas</p>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {editingId ? 'Edit Tugas Kelas' : 'Unggah Tugas'}
        </h2>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Tugas</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Praktikum 1"
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Jurusan</label>
              <select
                value={selectedJurusanId}
                onChange={(e) => {
                  setSelectedJurusanId(e.target.value);
                  setSelectedKelasId('');
                }}
                required
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 text-slate-700 cursor-pointer"
              >
                <option value="">-- Pilih Jurusan --</option>
                {jurusanList.map((jur) => (
                  <option key={jur.id} value={jur.id}>
                    {jur.nama_jurusan} ({jur.kode_jurusan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kelas</label>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                required
                disabled={!selectedJurusanId}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 text-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Kelas Tujuan --</option>
                {classList.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nama_kelas} {cls.nama_matkul ? `(${cls.nama_matkul})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline / Tenggat Waktu</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Tugas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan instruksi atau detail tugas di sini..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lampiran File Baru (Opsional)</label>
            <input
              id="task-file-input"
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full h-10 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setTitle(''); setSelectedJurusanId(''); setSelectedKelasId(''); setDescription(''); setDeadline(''); }}
                className="h-10 rounded-lg bg-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Menyimpan...' : editingId ? 'Perbarui Tugas' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-800">Riwayat Tugas yang Diunggah</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <th className="py-3 px-3">Judul Tugas</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-3">Deskripsi</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-medium text-slate-900">{task.judul}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-200">
                        {task.nama_kelas || `Kelas #${task.kelas_id}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 truncate max-w-xs text-slate-600">{task.deskripsi || '-'}</td>
                    <td className="py-3 px-3 text-slate-600">{task.deadline ? new Date(task.deadline).toLocaleString('id-ID') : 'Tanpa Deadline'}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTask(task)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(task)}
                          className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(task)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-sm">
                    Belum ada riwayat tugas yang diunggah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedTask && (
        <DosenSubmissionList 
          token={getToken()} 
          selectedTask={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Hapus Tugas Ini?</h3>
            <p className="text-sm text-center text-slate-500 mb-6">
              Apakah kamu yakin ingin menghapus tugas <span className="font-semibold text-slate-700">"{taskToDelete?.judul}"</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}