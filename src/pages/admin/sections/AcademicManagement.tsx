import { useEffect, useState, type FormEvent } from 'react';

type Account = {
    name: string;
    email: string;
    role: string;
};


type Jurusan = {
    id: number;
    kode_jurusan: string;
    nama_jurusan: string;
};

type Dosen = {
    id: number;
    nama: string;
    nidn: string;
    jurusan_id: number;
};

type Matkul = {
    id: number;
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    jurusan_id: number;
};

export default function UserManagement() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('mahasiswa');
    const [notice, setNotice] = useState('');
    const [jurusan, setJurusan] = useState<Jurusan[]>([]);
    const [dosen, setDosen] = useState<Dosen[]>([]);
    const [matkul, setMatkul] = useState<Matkul[]>([]);
    const [selectedJurusan, setSelectedJurusan] = useState('');
    const [selectedDosen, setSelectedDosen] = useState('');
    const [selectedMatkul, setSelectedMatkul] = useState('');
    const [namaKelas, setNamaKelas] = useState('');
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
    const [hari, setHari] = useState('Senin');
    const [jamMulai, setJamMulai] = useState('08:00');
    const [jamSelesai, setJamSelesai] = useState('10:00');
    const [ruangan, setRuangan] = useState('');
    const [academicLoading, setAcademicLoading] = useState(true);
    const [academicNotice, setAcademicNotice] = useState('');
    const [academicError, setAcademicError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        async function getAcademicData() {
            try {
                setAcademicLoading(true);
                setAcademicError('');

                const response = await fetch(
                    `${API_URL}/admin/academic-data`
                );

                if (!response.ok) {
                    throw new Error(
                        `Gagal mengambil data akademik (${response.status})`
                    );
                }

                const data = await response.json();
                console.log('DATA AKADEMIK:', data);
                setJurusan(data.jurusan ?? []);
                setDosen(data.dosen ?? []);
                setMatkul(data.matkul ?? []);
                if (data.jurusan?.length > 0) {
                    setSelectedJurusan(String(data.jurusan[0].id));
                }
            } catch (error) {
                console.error(
                    'Gagal mengambil data akademik:',
                    error
                );

                setAcademicError(
                    'Data jurusan, dosen, atau mata kuliah gagal dimuat.'
                );
            } finally {
                setAcademicLoading(false);
            }
        }

        getAcademicData();
    }, [API_URL]);

    const filteredDosen = dosen.filter(
        (item) =>
            String(item.jurusan_id) === selectedJurusan
    );

    const filteredMatkul = matkul.filter(
        (item) =>
            String(item.jurusan_id) === selectedJurusan
    );

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setAccounts((current) => [
            {
                name,
                email,
                role,
            },
            ...current,
        ]);

        setNotice(
            `Akun ${role} untuk ${email} ditambahkan ke pratinjau lokal.`
        );

        setName('');
        setEmail('');
    }

    async function handleCreateClass(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setAcademicNotice('');
        setAcademicError('');

        if (!selectedJurusan) {
            setAcademicError('Silakan pilih jurusan.');
            return;
        }

        if (!selectedDosen) {
            setAcademicError('Silakan pilih dosen.');
            return;
        }

        if (!selectedMatkul) {
            setAcademicError('Silakan pilih mata kuliah.');
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/admin/academic-classes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        dosen_id: Number(selectedDosen),
                        matkul_id: Number(selectedMatkul),
                        nama_kelas: namaKelas,
                        tahun_ajaran: tahunAjaran,
                        hari,
                        jam_mulai: jamMulai,
                        jam_selesai: jamSelesai,
                        ruangan,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        'Gagal membuat kelas dan jadwal.'
                );
            }

            setAcademicNotice(
                'Kelas dan jadwal berhasil dibuat.'
            );

            setSelectedDosen('');
            setSelectedMatkul('');
            setNamaKelas('');
            setTahunAjaran('2026/2027');
            setHari('Senin');
            setJamMulai('08:00');
            setJamSelesai('10:00');
            setRuangan('');
        } catch (error) {
            console.error(
                'Gagal membuat kelas:',
                error
            );

            setAcademicError(
                error instanceof Error
                    ? error.message
                    : 'Gagal membuat kelas dan jadwal.'
            );
        }
    }

    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Pengguna
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                        Buat akun kampus
                    </h2>
                </div>

                <form
                    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
                    onSubmit={handleSubmit}
                >
                    <label className="text-sm font-medium text-slate-700">
                        Nama

                        <input
                            className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                            value={name}
                        />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        Email

                        <input
                            className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                            type="email"
                            value={email}
                        />
                    </label>

                    <label className="text-sm font-medium text-slate-700">
                        Peran

                        <select
                            className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
                            onChange={(event) =>
                                setRole(event.target.value)
                            }
                            value={role}
                        >
                            <option value="mahasiswa">
                                Mahasiswa
                            </option>

                            <option value="dosen">
                                Dosen
                            </option>
                        </select>
                    </label>

                    <button
                        className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
                        type="submit"
                    >
                        Buat akun
                    </button>
                </form>

                {notice && (
                    <p
                        aria-live="polite"
                        className="mt-3 text-sm text-cyan-800"
                    >
                        {notice}
                    </p>
                )}

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="border-y border-slate-200 text-xs text-slate-500">
                            <tr>
                                <th className="py-3 font-medium">
                                    Nama
                                </th>

                                <th className="py-3 font-medium">
                                    Email
                                </th>

                                <th className="py-3 font-medium">
                                    Peran
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {accounts.length ? (
                                accounts.map(
                                    (account, index) => (
                                        <tr
                                            className="border-b border-slate-100"
                                            key={`${account.email}-${index}`}
                                        >
                                            <td className="py-3 font-medium">
                                                {account.name}
                                            </td>

                                            <td className="py-3 text-slate-600">
                                                {account.email}
                                            </td>

                                            <td className="py-3 capitalize text-slate-600">
                                                {account.role}
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        className="py-5 text-slate-500"
                                        colSpan={3}
                                    >
                                        Belum ada akun baru pada
                                        sesi ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                    Data akun saat ini hanya pratinjau lokal.
                </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">
                        Akademik
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                        Manajemen Kelas & Jadwal
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Atur dosen, mata kuliah, kelas, dan jadwal
                        perkuliahan.
                    </p>
                </div>

                {academicLoading ? (
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                        Memuat data akademik...
                    </div>
                ) : (
                    <form
                        className="grid gap-x-4 gap-y-4 sm:grid-cols-2"
                        onSubmit={handleCreateClass}
                    >
                        {/* JURUSAN */}

                        <label className="text-sm font-medium text-slate-700">
                            Jurusan

                            <select
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
                                value={selectedJurusan}
                                onChange={(event) => {
                                    setSelectedJurusan(
                                        event.target.value
                                    );

                                    setSelectedDosen('');
                                    setSelectedMatkul('');
                                }}
                                required
                            >
                                <option value="">
                                    Pilih jurusan
                                </option>

                                {jurusan.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.kode_jurusan} -{' '}
                                        {item.nama_jurusan}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Dosen

                            <select
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-100 disabled:text-slate-400"
                                value={selectedDosen}
                                onChange={(event) =>
                                    setSelectedDosen(
                                        event.target.value
                                    )
                                }
                                disabled={!selectedJurusan}
                                required
                            >
                                <option value="">
                                    Pilih dosen
                                </option>

                                {filteredDosen.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.nama}
                                    </option>
                                ))}
                            </select>

                            {selectedJurusan &&
                                filteredDosen.length === 0 && (
                                    <p className="mt-1 text-xs text-orange-600">
                                        Belum ada dosen pada
                                        jurusan ini.
                                    </p>
                                )}
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Mata Kuliah
                            <select
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600 disabled:bg-slate-100 disabled:text-slate-400"
                                value={selectedMatkul}
                                onChange={(event) =>
                                    setSelectedMatkul(
                                        event.target.value
                                    )
                                }
                                disabled={!selectedJurusan}
                                required
                            >
                                <option value="">
                                    Pilih mata kuliah
                                </option>

                                {filteredMatkul.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.kode_matkul} -{' '}
                                        {item.nama_matkul}
                                    </option>
                                ))}
                            </select>

                            {selectedJurusan &&
                                filteredMatkul.length === 0 && (
                                    <p className="mt-1 text-xs text-orange-600">
                                        Belum ada mata kuliah pada
                                        jurusan ini.
                                    </p>
                                )}
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Kode Kelas

                            <input
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                                placeholder="Contoh: SDLC4"
                                value={namaKelas}
                                onChange={(event) =>
                                    setNamaKelas(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Tahun Ajaran
                            <input
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                                value={tahunAjaran}
                                onChange={(event) =>
                                    setTahunAjaran(
                                        event.target.value
                                    )
                                }
                                placeholder="2026/2027"
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Hari
                            <select
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600"
                                value={hari}
                                onChange={(event) =>
                                    setHari(event.target.value)
                                }
                                required
                            >
                                <option value="Senin">
                                    Senin
                                </option>

                                <option value="Selasa">
                                    Selasa
                                </option>

                                <option value="Rabu">
                                    Rabu
                                </option>

                                <option value="Kamis">
                                    Kamis
                                </option>

                                <option value="Jumat">
                                    Jumat
                                </option>

                                <option value="Sabtu">
                                    Sabtu
                                </option>
                            </select>
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Jam Mulai

                            <input
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                                type="time"
                                value={jamMulai}
                                onChange={(event) =>
                                    setJamMulai(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Jam Selesai

                            <input
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                                type="time"
                                value={jamSelesai}
                                onChange={(event) =>
                                    setJamSelesai(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        <label className="text-sm font-medium text-slate-700">
                            Ruangan

                            <input
                                className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600"
                                placeholder="Contoh: Computer Lab"
                                value={ruangan}
                                onChange={(event) =>
                                    setRuangan(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </label>

                        {(academicError ||
                            academicNotice) && (
                            <div className="sm:col-span-2">
                                {academicError && (
                                    <p
                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                                        aria-live="polite"
                                    >
                                        {academicError}
                                    </p>
                                )}

                                {academicNotice && (
                                    <p
                                        className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                                        aria-live="polite"
                                    >
                                        {academicNotice}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="sm:col-span-2">
                            <button
                                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                type="submit"
                                disabled={
                                    !selectedDosen ||
                                    !selectedMatkul
                                }
                            >
                                Buat Kelas & Jadwal
                            </button>
                        </div>
                    </form>
                )}

                {academicError &&
                    !academicLoading &&
                    jurusan.length === 0 && (
                        <p className="mt-4 text-sm text-red-600">
                            {academicError}
                        </p>
                    )}
            </section>
        </div>
    );
}