import { studentRequest, unwrapList } from './student';

export interface Task {
    id: number;
    judul: string;
    deskripsi: string | null;
    deadline: string;
    kode_matkul: string;
    nama_matkul: string;
    nama_dosen: string;
}

export async function getTasks(
    mahasiswaId: number,
    token: string | null
): Promise<Task[]> {
    const payload = await studentRequest<unknown>(
        `/tasks/${encodeURIComponent(mahasiswaId)}`,
        token
    );
    return unwrapList<Task>(payload, 'tasks', 'tugas');
}