
const API_URL = (
    import.meta.env.VITE_API_URL ||
    'http://backend-student-academic.test/api'
).replace(/\/+$/, '');

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
    id: string | number;
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

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    const result: unknown = await response.json().catch(() => null);

    if (
        result !== null &&
        typeof result === 'object' &&
        'message' in result &&
        typeof result.message === 'string'
    ) {
        return result.message;
    }

    return fallback;
}

export async function getJurusan(): Promise<Jurusan[]> {
    const response = await fetch(`${API_URL}/departments`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                `Gagal mengambil data jurusan (HTTP ${response.status}).`,
            ),
        );
    }

    const result: unknown = await response.json();

    if (Array.isArray(result)) {
        return result as Jurusan[];
    }

    if (
        result !== null &&
        typeof result === 'object' &&
        'data' in result &&
        Array.isArray(result.data)
    ) {
        return result.data as Jurusan[];
    }

    return [];
}

export async function getAcademicClasses(
    page: number = 1,
    perPage: number = 10,
    token?: string | null,
): Promise<AcademicClassPagination> {
    const authToken = token?.trim();

    if (!authToken) {
        throw new Error(
            'Token login tidak tersedia. Silakan login ulang.',
        );
    }

    const params = new URLSearchParams({
        page: String(Math.max(1, Math.floor(page))),
        per_page: String(
            Math.min(100, Math.max(1, Math.floor(perPage))),
        ),
    });

    const response = await fetch(
        `${API_URL}/academic-classes?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );

    if (!response.ok) {
        let message = await getErrorMessage(
            response,
            `Gagal mengambil data kelas akademik (HTTP ${response.status}).`,
        );

        if (response.status === 401) {
            message =
                'Autentikasi gagal (401). Token tidak valid atau kedaluwarsa. Silakan login ulang.';
        } else if (response.status === 403) {
            message =
                'Akses ditolak (403). Periksa izin akses pengguna di backend.';
        }

        throw new Error(message);
    }

    const result: unknown = await response.json();

    if (
        result === null ||
        typeof result !== 'object' ||
        !('data' in result) ||
        !Array.isArray(result.data) ||
        !('current_page' in result) ||
        !('last_page' in result)
    ) {
        throw new Error(
            'Format respons pagination tidak valid. Periksa respons API Laravel.',
        );
    }

    return result as AcademicClassPagination;
}
