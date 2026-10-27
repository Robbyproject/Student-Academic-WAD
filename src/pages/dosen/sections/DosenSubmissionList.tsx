import { useEffect, useState } from "react";

interface Submission {
  id: number;
  judul_tugas: string;
  nama_kelas: string;
  kode_matkul: string;
  nama_matkul: string;
  nim: string;
  nama_mahasiswa: string;
  file_submission_path: string;
  nilai: number | null;
  catatan_dosen: string | null;
  submitted_at: string;
}

interface Task {
  id: number;
  judul: string;
}

interface DosenSubmissionListProps {
  token: string | null;
  selectedTask: Task;
  onClose: () => void;
}

function formatWaktuLokal(utcDateString: string) {
  if (!utcDateString) return "-";
  const date = new Date(
    utcDateString.endsWith("Z") ? utcDateString : utcDateString + "Z"
  );
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DosenSubmissionList({ token, selectedTask, onClose }: DosenSubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination State untuk Submissions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const apiUrl = import.meta.env.VITE_API_URL || "http://backend-student-academic.test/api";
      
      const response = await fetch(`${apiUrl}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengumpulan tugas.");
      }

      const data = await response.json();
      const allSubmissions: Submission[] = Array.isArray(data) ? data : data.data || [];
      
      const filtered = allSubmissions.filter(
        (sub) => sub.judul_tugas?.toLowerCase() === selectedTask?.judul?.toLowerCase()
      );
      setSubmissions(filtered);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setCurrentPage(1); // Reset ke halaman 1 saat tugas diganti
      fetchSubmissions();
    }
  }, [selectedTask, token]);

  // Logika Pagination Submissions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = submissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(submissions.length / itemsPerPage);

  const backendStorageUrl = import.meta.env.VITE_STORAGE_URL || "http://backend-student-academic.test/storage";

  return (
    <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Daftar Pengumpulan Tugas: <span className="text-blue-600">{selectedTask?.judul}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Melihat berkas jawaban yang telah dikirim oleh mahasiswa untuk tugas ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSubmissions}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Refresh Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition cursor-pointer"
          >
            Tutup ✕
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p className="py-8 text-center text-xs text-slate-500">
            Memuat pengumpulan tugas...
          </p>
        ) : error ? (
          <p className="py-8 text-center text-xs text-red-600">{error}</p>
        ) : submissions.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">
            Belum ada mahasiswa yang mengumpulkan tugas ini.
          </p>
        ) : (
          <>
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Mahasiswa</th>
                  <th className="py-3 px-4">Tugas & Matkul</th>
                  <th className="py-3 px-4">Waktu Submit</th>
                  <th className="py-3 px-4">Berkas</th>
                  <th className="py-3 px-4">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {item.nama_mahasiswa}
                      </div>
                      <div className="text-[11px] text-slate-400">NIM: {item.nim}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {item.judul_tugas}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.nama_matkul} ({item.nama_kelas})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {formatWaktuLokal(item.submitted_at)}
                    </td>
                    <td className="py-3 px-4">
                      {item.file_submission_path ? (
                        <a
                          href={`${backendStorageUrl}/${item.file_submission_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 underline"
                        >
                          Lihat Berkas
                        </a>
                      ) : (
                        <span className="text-slate-400">Tidak ada file</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.nilai !== null ? (
                        <span className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                          {item.nilai}
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                          Belum Dinilai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Navigasi Pagination Pengumpulan Tugas */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
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
          </>
        )}
      </div>
    </section>
  );
}