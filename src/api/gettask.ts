export interface Task {
    id: number;
    judul: string;
    deskripsi: string | null;
    deadline: string;
    kode_matkul: string;
    nama_matkul: string;
    nama_dosen: string;
}

export async function getTasks(mahasiswaId: number): Promise<Task[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks/${mahasiswaId}`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil data tugas");
    }

    return response.json();
}