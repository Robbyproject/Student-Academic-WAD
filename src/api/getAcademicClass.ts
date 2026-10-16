export interface AcademicClass {
    id: string;
    nama_kelas: string;
    tahun_ajaran: string;
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    nama_dosen: string;
    schedules: string[];
}
export interface Jurusan {
    id: string;
    nama_jurusan: string;
    kode_jurusan: string;
}

export async function getJurusan(): Promise<Jurusan[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/departments`
    );

    if (!response.ok) {
        throw new Error('Gagal mengambil data jurusan');
    }

    return response.json();
}

export async function getAcademicClasses(): Promise<AcademicClass[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/academic-classes`
    );

    if (!response.ok) {
        throw new Error('Gagal mengambil data kelas akademik');
    }

    return response.json();
}