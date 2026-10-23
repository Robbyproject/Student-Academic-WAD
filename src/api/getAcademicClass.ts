
export interface AcademicClass {
    id: string | number;
    nama_kelas: string;
    tahun_ajaran: string;
    term?: string;
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

export interface AcademicClassPagination {
    current_page: number;
    data: AcademicClass[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
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

export async function getAcademicClasses(
    page: number = 1,
    perPage: number = 10,
): Promise<AcademicClassPagination> {
    const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
    });

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/academic-classes?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error('Gagal mengambil data kelas akademik');
    }

    return response.json();
}
