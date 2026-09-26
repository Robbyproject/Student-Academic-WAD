export interface Task {
    id: string;
    judul: string;
    deskripsi: string | null;
    deadline: string;
    kode_matkul: string;
    nama_matkul: string;
}

export async function getTasks(): Promise<Task[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tasks`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil data tugas");
    }

    return response.json();
}