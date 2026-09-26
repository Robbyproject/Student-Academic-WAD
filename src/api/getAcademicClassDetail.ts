export interface AcademicClassDetail {
    id: string;
    nama_kelas: string;
    tahun_ajaran: string;
    kode_matkul: string;
    nama_matkul: string;
    sks: number;
    nama_dosen: string;
    jumlah_mahasiswa: number;
}

export async function getAcademicClassDetail(
    id: string
): Promise<AcademicClassDetail> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/academic-classes/${id}`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil detail kelas");
    }

    return response.json();
}