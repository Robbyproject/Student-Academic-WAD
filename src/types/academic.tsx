export interface Schedule {
    id: number;
    day: string;
    date: string;
    time: string;
    course: string;
    code: string;
    room: string;
    lecturer: string;
}

export interface Task {
    id: number;
    title: string;
    course: string;
    deadline: string;
    status: "Belum" | "Dikerjakan" | "Selesai";
}