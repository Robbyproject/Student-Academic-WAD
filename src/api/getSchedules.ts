import { studentRequest, unwrapList } from './student';
export interface Schedule {
    id: number;
    kelas_id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string | null;
    nama_kelas: string;
    kode_matkul: string;
    nama_matkul: string;
    nama_dosen: string;
}

export interface SchedulePayload {
    kelas_id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
}

/**
 * Mengambil jadwal berdasarkan pengguna yang sedang login.
 *
 * Backend menentukan hak akses berdasarkan token:
 * - Mahasiswa: jadwal sesuai jurusan.
 * - Dosen: jadwal kelas yang diajar.
 * - Admin: semua jadwal.
 */
export async function getSchedules(
    token: string | null,
): Promise<Schedule[]> {
    const payload = await studentRequest<unknown>(
        '/schedules',
        token,
    );

    return unwrapList<Schedule>(
        payload,
        'schedules',
        'jadwal',
    );
}

/**
 * Membuat jadwal baru (admin).
 */
export async function createSchedule(
    data: SchedulePayload,
    token: string | null,
): Promise<{ message: string; id: number }> {
    return studentRequest('/schedules', token, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Mengubah jadwal (admin).
 */
export async function updateSchedule(
    id: number,
    data: SchedulePayload,
    token: string | null,
): Promise<{ message: string }> {
    return studentRequest(`/schedules/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Menghapus jadwal (admin).
 */
export async function deleteSchedule(
    id: number,
    token: string | null,
): Promise<{ message: string }> {
    return studentRequest(`/schedules/${id}`, token, {
        method: 'DELETE',
    });
}
