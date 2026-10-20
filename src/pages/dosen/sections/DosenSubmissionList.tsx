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

// Helper untuk format UTC ke Waktu Lokal Laptop Pengguna (Standar Industri)
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

export default function DosenSubmissionList({ token }: { token: string | null }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://backend-student-academic.test/api";
      const response = await fetch(`${apiUrl}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengumpulan tugas.");
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [token]);

  const backendStorageUrl =
    import.meta.env.VITE_STORAGE_URL || "http://backend-student-academic.test/storage";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Daftar Pengumpulan Tugas Mahasiswa
          </h2>
          <p className="text-xs text-slate-500">
            Melihat berkas jawaban yang telah dikirim oleh mahasiswa.
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Refresh Data
        </button>
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
            Belum ada mahasiswa yang mengumpulkan tugas.
          </p>
        ) : (
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
              {submissions.map((item) => (
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
                        className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 underline"
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
        )}
      </div>
    </div>
  );
}