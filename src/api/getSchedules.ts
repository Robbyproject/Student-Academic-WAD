export interface Schedule {
    id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    nama_kelas: string;
    kode_matkul: string;
    nama_matkul: string;
    nama_dosen: string;
}

export async function getSchedules(): Promise<Schedule[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/schedules`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil jadwal");
    }

    return response.json();
}