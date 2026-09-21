export interface Schedule {
    id: number;
    day: string;
    date: number;
    session: string;
    course: string;
    code: string;
    time: string;
    room: string;
}

// export interface Task {
//     id: number;
//     title: string;
//     course: string;
//     deadline: string;
//     status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai";
// }

export const scheduleData: Schedule[] = [
    {
        id: 1,
        day: "Sen",
        date: 21,
        session: "Sesi 5",
        course: "Software Development Life Cycle",
        code: "SDLC4",
        time: "08:30 - 10:00 WIB",
        room: "Kemang - Computer Lab.",
    },
    {
        id: 2,
        day: "Sen",
        date: 21,
        session: "Sesi 6",
        course: "Software Development Life Cycle",
        code: "SDLC4",
        time: "10:00 - 11:30 WIB",
        room: "Kemang - Computer Lab.",
    },
    {
        id: 3,
        day: "Sel",
        date: 22,
        session: "Sesi 2",
        course: "Advanced Database Systems",
        code: "DBAS1",
        time: "08:30 - 11:00 WIB",
        room: "Kemang - Sumbawa",
    },
    {
        id: 4,
        day: "Rab",
        date: 23,
        session: "Sesi 4",
        course: "Data Structures and Algorithms",
        code: "DSA01",
        time: "13:00 - 15:30 WIB",
        room: "Kemang - Computer Lab.",
    },
    {
        id: 5,
        day: "Kam",
        date: 24,
        session: "Sesi 3",
        course: "Software Development Fundamentals",
        code: "SDF04",
        time: "11:00 - 12:30 WIB",
        room: "Kemang - Bali",
    },
    {
        id: 6,
        day: "Jum",
        date: 25,
        session: "Sesi 1",
        course: "Web Application Development",
        code: "WAD04",
        time: "13:00 - 15:30 WIB",
        room: "Kemang - Bali",
    },
];

export interface Task {
    id: number;
    title: string;
    course: string;
    deadline: string;
    completed: boolean;
}

export const taskData: Task[] = [
    {
        id: 1,
        title: "Membuat ERD Database",
        course: "Advanced Database Systems",
        deadline: "2026-09-23",
        completed: false,
    },
    {
        id: 2,
        title: "Membuat React Web Application",
        course: "Web Application Development",
        deadline: "2026-09-25",
        completed: false,
    },
    {
        id: 3,
        title: "Laporan SDLC",
        course: "Software Development Life Cycle",
        deadline: "2026-09-28",
        completed: false,
    },

    // Contoh tugas yang sudah dikerjakan
    {
        id: 4,
        title: "Membuat Use Case Diagram",
        course: "Software Development Life Cycle",
        deadline: "2026-09-20",
        completed: true,
    },
];