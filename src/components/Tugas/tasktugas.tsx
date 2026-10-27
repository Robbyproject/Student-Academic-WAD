import { useEffect, useState } from "react";
import { getTasks, type Task } from "../../api/gettask";

function parseLocalDate(value: string): Date {
  const dateOnly = value.substring(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function ClockIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function NotePencilIcon() {
  return (
    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 8 16l1.2-4z" />
      <path d="M7 8h4M7 12h1" />
    </svg>
  );
}

interface TaskTugasProps {
  mahasiswaId?: number;
  token: string | null;
  onSelectTask?: (isOpeningDetail: boolean) => void; // Prop opsional untuk memberitahu parent page
}

export default function TaskTugas({ mahasiswaId, token, onSelectTask }: TaskTugasProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fetchTasksList = () => {
    if (!mahasiswaId) {
      setError("ID mahasiswa tidak ditemukan pada data login.");
      setLoading(false);
      return;
    }

    getTasks(mahasiswaId, token)
      .then((data) => {
        setTasks(data);
        setError("");
      })
      .catch((requestError: unknown) => {
        console.error("Gagal mengambil data tugas:", requestError);
        setError(requestError instanceof Error ? requestError.message : "Gagal mengambil data tugas.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchTasksList();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [mahasiswaId, token]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeTasks = tasks.filter((task) => {
    const deadline = parseLocalDate(task.deadline);
    return deadline >= today;
  });

  // Handler memilih/menutup tugas & memberi info ke parent
  const handleSelectTask = (task: Task | null) => {
    setSelectedTask(task);
    setFileToUpload(null);
    setUploadMessage("");
    if (onSelectTask) {
      onSelectTask(task !== null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !fileToUpload || !mahasiswaId) return;

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("tugas_id", String(selectedTask.id));
    formData.append("mahasiswa_id", String(mahasiswaId));
    formData.append("file", fileToUpload);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://backend-student-academic.test/api';
      const response = await fetch(`${apiUrl}/submissions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal mengunggah tugas.");
      }

      alert("Tugas berhasil dikumpulkan!");
      handleSelectTask(null);
      fetchTasksList();
    } catch (err: any) {
      setUploadMessage(err.message || "Terjadi kesalahan saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  const backendStorageUrl =
    import.meta.env.VITE_STORAGE_URL || "http://backend-student-academic.test/storage";

  // -------------------------------------------------------------
  // TAMPILAN HALAMAN DETAIL TUGAS (FULL-PAGE LEBAR HORIZON)
  // -------------------------------------------------------------
  if (selectedTask) {
    const isPastDeadline = parseLocalDate(selectedTask.deadline) < today;

    return (
      <div className="w-full space-y-4">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            onClick={() => handleSelectTask(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            ← Kembali ke Daftar Tugas
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Status Pengumpulan:</span>
            <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
              Belum Mengumpulkan
            </span>
          </div>
        </div>

        {/* Informational Ringkas Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800 mb-4">{selectedTask.judul}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs">
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mata Kuliah</span>
              <span className="font-semibold text-slate-700">{selectedTask.nama_matkul || "-"} ({selectedTask.kode_matkul || "-"})</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dosen Pengampu</span>
              <span className="font-semibold text-slate-700">{selectedTask.nama_dosen || "-"}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Batas Waktu (Deadline)</span>
              <span className="font-bold text-orange-600">
                {parseLocalDate(selectedTask.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Grid 2 Kolom Horizontal (Deskripsi Kiri - Upload Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Kolom Kiri: Deskripsi & Berkas Soal */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi & Instruksi Tugas</h3>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[140px]">
                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                  {selectedTask.deskripsi || "Tidak ada deskripsi detail dari dosen."}
                </p>
              </div>
            </div>

            {selectedTask.file_attachment_path && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran Soal dari Dosen</h3>
                <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs">
                  <span className="text-blue-700 font-semibold truncate pr-2">📄 Berkas Soal Tugas</span>
                  <a
                    href={`${backendStorageUrl}/${selectedTask.file_attachment_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Unduh File
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Upload Jawaban */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upload Lembar Jawaban</h3>

              {isPastDeadline ? (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center text-xs font-semibold text-red-600">
                  Waktu pengumpulan telah ditutup.
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center bg-slate-50/50">
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Pilih File Jawaban Kamu</label>
                    <input
                      type="file"
                      onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                      required
                    />
                    <span className="block mt-2 text-[10px] text-slate-400">Ukuran berkas maksimal 10MB</span>
                  </div>

                  {uploadMessage && (
                    <p className="text-xs text-red-600 font-medium">{uploadMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={uploading || !fileToUpload}
                    className="w-full rounded-xl bg-orange-500 py-3 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition shadow-sm"
                  >
                    {uploading ? "Mengirim..." : "Kumpulkan Jawaban"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TAMPILAN UTAMA DAFTAR TUGAS (SEBELUM DIKLIK)
  // -------------------------------------------------------------
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-5 pt-5 pb-4">
        <h2 className="min-w-0 break-words text-base font-semibold text-slate-800">
          Tugas Belum Dikumpulkan
        </h2>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">
          {activeTasks.length}
        </span>
      </div>

      <div className="mx-5 h-px bg-slate-100" />

      <div className="p-4">
        {loading ? (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-500">Memuat tugas...</p>
          </div>
        ) : error ? (
          <p aria-live="polite" className="py-6 text-center text-xs text-red-600">
            {error}
          </p>
        ) : activeTasks.length > 0 ? (
          <div className="space-y-3">
            {activeTasks.map((task) => {
              const formattedDeadline = parseLocalDate(task.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <article
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="cursor-pointer rounded-xl border-l-4 border-orange-400 bg-orange-50 px-4 py-4 transition hover:bg-orange-100/60"
                >
                  <h3 className="break-words text-sm font-semibold leading-5 text-slate-800">
                    {task.judul}
                  </h3>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {task.nama_matkul} • Dosen: {task.nama_dosen}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                    <ClockIcon />
                    <span className="break-words">Deadline {formattedDeadline}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-400">
              <NotePencilIcon />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Tidak ada tugas yang perlu dikumpulkan
            </p>
          </div>
        )}
      </div>
    </section>
  );
}