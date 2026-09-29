import { useEffect, useState } from 'react';

type Jurusan = {
    id: string;
    kode_jurusan: string;
    nama_jurusan: string;
};

type Dosen = {
    id: string;
    nama: string;
    nidn: string;
    jurusan_id: string;
};

type Matkul = {
    id: string;
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    jurusan_id: string;
};

type AcademicData = {
    jurusan: Jurusan[];
    dosen: Dosen[];
    matkul: Matkul[];
};

const API_URL = import.meta.env.VITE_API_URL;

export default function AcademicManagement() {
    const [data, setData] = useState<AcademicData>({
        jurusan: [],
        dosen: [],
        matkul: [],
    });

    const [jurusanId, setJurusanId] = useState('');
    const [dosenId, setDosenId] = useState('');
    const [matkulId, setMatkulId] = useState('');
    const [namaKelas, setNamaKelas] = useState('');
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');

    const [hari, setHari] = useState('Senin');
    const [jamMulai, setJamMulai] = useState('08:00');
    const [jamSelesai, setJamSelesai] = useState('10:00');
    const [ruangan, setRuangan] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function getAcademicData() {
            try {
                const response = await fetch(
                    `${API_URL}/admin/academic-data`
                );

                if (!response.ok) {
                    throw new Error('Gagal mengambil data akademik');
                }

                const result = await response.json();

                setData(result);
            } catch (error) {
                console.error(error);
                setMessage('Gagal mengambil data akademik.');
            } finally {
                setLoading(false);
            }
        }

        getAcademicData();
    }, []);

    const filteredDosen = data.dosen.filter(
        (dosen) => dosen.jurusan_id === jurusanId
    );

    const filteredMatkul = data.matkul.filter(
        (matkul) => matkul.jurusan_id === jurusanId
    );

    async function handleCreateClass() {
        if (
            !jurusanId ||
            !dosenId ||
            !matkulId ||
            !namaKelas ||
            !ruangan
        ) {
            setMessage('Lengkapi semua data terlebih dahulu.');
            return;
        }

        try {
            setSaving(true);
            setMessage('');

            const response = await fetch(
                `${API_URL}/admin/academic-classes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        dosen_id: dosenId,
                        matkul_id: matkulId,
                        nama_kelas: namaKelas,
                        tahun_ajaran: tahunAjaran,
                        hari,
                        jam_mulai: jamMulai,
                        jam_selesai: jamSelesai,
                        ruangan,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Gagal membuat kelas'
                );
            }

            setMessage('Kelas dan jadwal berhasil dibuat.');

            setNamaKelas('');
            setRuangan('');
            setJamMulai('08:00');
            setJamSelesai('10:00');
        } catch (error) {
            console.error(error);

            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Gagal membuat kelas.'
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">
                    Memuat data akademik...
                </p>
            </section>
        );
    }

    return (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                    Akademik
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    Manajemen Kelas & Jadwal
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                    Atur dosen, mata kuliah, kelas, dan jadwal perkuliahan.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* JURUSAN */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Jurusan
                    </label>

                    <select
                        value={jurusanId}
                        onChange={(event) => {
                            setJurusanId(event.target.value);
                            setDosenId('');
                            setMatkulId('');
                        }}
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    >
                        <option value="">
                            Pilih jurusan
                        </option>

                        {data.jurusan.map((jurusan) => (
                            <option
                                key={jurusan.id}
                                value={jurusan.id}
                            >
                                {jurusan.kode_jurusan} -{' '}
                                {jurusan.nama_jurusan}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DOSEN */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Dosen
                    </label>

                    <select
                        value={dosenId}
                        onChange={(event) =>
                            setDosenId(event.target.value)
                        }
                        disabled={!jurusanId}
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm disabled:bg-slate-100"
                    >
                        <option value="">
                            Pilih dosen
                        </option>

                        {filteredDosen.map((dosen) => (
                            <option
                                key={dosen.id}
                                value={dosen.id}
                            >
                                {dosen.nama}
                            </option>
                        ))}
                    </select>
                </div>

                {/* MATA KULIAH */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Mata Kuliah
                    </label>

                    <select
                        value={matkulId}
                        onChange={(event) =>
                            setMatkulId(event.target.value)
                        }
                        disabled={!jurusanId}
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm disabled:bg-slate-100"
                    >
                        <option value="">
                            Pilih mata kuliah
                        </option>

                        {filteredMatkul.map((matkul) => (
                            <option
                                key={matkul.id}
                                value={matkul.id}
                            >
                                {matkul.kode_matkul} -{' '}
                                {matkul.nama_matkul}
                            </option>
                        ))}
                    </select>
                </div>

                {/* NAMA KELAS */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Nama Kelas
                    </label>

                    <input
                        value={namaKelas}
                        onChange={(event) =>
                            setNamaKelas(event.target.value)
                        }
                        placeholder="Contoh: SDLC4"
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                </div>

                {/* TAHUN AJARAN */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Tahun Ajaran
                    </label>

                    <input
                        value={tahunAjaran}
                        onChange={(event) =>
                            setTahunAjaran(event.target.value)
                        }
                        placeholder="2026/2027"
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                </div>

                {/* HARI */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Hari
                    </label>

                    <select
                        value={hari}
                        onChange={(event) =>
                            setHari(event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    >
                        <option>Senin</option>
                        <option>Selasa</option>
                        <option>Rabu</option>
                        <option>Kamis</option>
                        <option>Jumat</option>
                        <option>Sabtu</option>
                        <option>Minggu</option>
                    </select>
                </div>

                {/* JAM MULAI */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Jam Mulai
                    </label>

                    <input
                        type="time"
                        value={jamMulai}
                        onChange={(event) =>
                            setJamMulai(event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                </div>

                {/* JAM SELESAI */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Jam Selesai
                    </label>

                    <input
                        type="time"
                        value={jamSelesai}
                        onChange={(event) =>
                            setJamSelesai(event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                </div>

                {/* RUANGAN */}
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Ruangan
                    </label>

                    <input
                        value={ruangan}
                        onChange={(event) =>
                            setRuangan(event.target.value)
                        }
                        placeholder="Contoh: Computer Lab"
                        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                </div>
            </div>

            {message && (
                <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {message}
                </div>
            )}

            <button
                type="button"
                onClick={handleCreateClass}
                disabled={saving}
                className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
                {saving ? 'Menyimpan...' : 'Buat Kelas & Jadwal'}
            </button>
        </section>
    );
}