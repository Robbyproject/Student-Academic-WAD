import { studentRequest, unwrapList } from './student';

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

export async function getSchedules(token: string | null): Promise<Schedule[]> {
    const payload = await studentRequest<unknown>('/schedules', token);
    return unwrapList<Schedule>(payload, 'schedules', 'jadwal');
}