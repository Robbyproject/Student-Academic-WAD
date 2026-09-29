export interface Matkul {
    id: string;
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    jurusan_id: string;
}

export async function getMatkul(): Promise<Matkul[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/matkul`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil mata kuliah");
    }

    return response.json();
}