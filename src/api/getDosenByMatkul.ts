export interface Dosen {
    id: string;
    nama: string;
    nidn: string;
}

export async function getDosenByMatkul(
    matkulId: string
): Promise<Dosen[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/academic-classes/lecturers/${matkulId}`
    );

    if (!response.ok) {
        throw new Error("Gagal mengambil dosen");
    }

    return response.json();
}