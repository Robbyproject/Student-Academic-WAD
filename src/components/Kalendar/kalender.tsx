import { useEffect, useState } from "react";
import {
    getSchedules,
    type Schedule,
} from "../../api/getSchedules";

type IconProps = {
    className?: string;
};

const iconBase = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
};

function BookIcon({ className }: IconProps) {
    return (
        <svg {...iconBase} className={className}>
            <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
            <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

function ClockIcon({ className }: IconProps) {
    return (
        <svg {...iconBase} className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

function PinIcon({ className }: IconProps) {
    return (
        <svg {...iconBase} className={className}>
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function CalendarOffIcon({ className }: IconProps) {
    return (
        <svg
            {...iconBase}
            width={22}
            height={22}
            className={className}
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function normalizeDay(day: string | null | undefined): string {
    return String(day ?? "")
        .trim()
        .toLocaleLowerCase("id-ID");
}

function formatTime(time: string | null | undefined): string {
    if (!time) return "--:--";
    return time.slice(0, 5);
}

function CalendarSchedule({ token }: { token: string | null }) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedDate, setSelectedDate] = useState<number>(
        new Date().getDate()
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSchedules() {
            setLoading(true);
            setError("");

            try {
                // Token diteruskan agar API dapat menentukan
                // jurusan mahasiswa yang sedang login.
                const data = await getSchedules(token);

                if (!cancelled) {
                    setSchedules(data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Gagal mengambil jadwal:", err);
                    setSchedules([]);
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Gagal mengambil jadwal kuliah."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadSchedules();

        return () => {
            cancelled = true;
        };
    }, [token]);

    /*
     * Membuat kalender Senin sampai Minggu berdasarkan
     * minggu yang sedang berjalan.
     */
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);

    const diffToMonday =
        currentDay === 0 ? -6 : 1 - currentDay;

    monday.setDate(today.getDate() + diffToMonday);

    const weekDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);

        return {
            day: date.toLocaleDateString("id-ID", {
                weekday: "short",
            }),
            fullDay: date.toLocaleDateString("id-ID", {
                weekday: "long",
            }),
            date: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
        };
    });

    /*
     * Menggunakan tanggal lengkap untuk menghindari
     * tanggal yang sama pada bulan berbeda tertukar.
     */
    const selectedDay = weekDays.find((item) => {
        const selected = new Date(
            today.getFullYear(),
            today.getMonth(),
            selectedDate
        );

        return (
            item.date === selectedDate &&
            item.month === selected.getMonth() &&
            item.year === selected.getFullYear()
        );
    });

    const selectedSchedules = schedules
        .filter(
            (schedule) =>
                normalizeDay(schedule.hari) ===
                normalizeDay(selectedDay?.fullDay)
        )
        .sort((a, b) =>
            formatTime(a.jam_mulai).localeCompare(
                formatTime(b.jam_mulai)
            )
        );

    const isToday =
        selectedDay?.date === today.getDate() &&
        selectedDay?.month === today.getMonth() &&
        selectedDay?.year === today.getFullYear();

    const dividerLabel = isToday
        ? "Today"
        : selectedDay
          ? `${selectedDay.fullDay}, ${selectedDay.date} ${new Date(
                selectedDay.year,
                selectedDay.month,
                selectedDay.date
            ).toLocaleDateString("id-ID", {
                month: "long",
            })}`
          : "";

    if (loading) {
        return (
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-5 py-5">
                    <h2 className="text-base font-semibold text-slate-800">
                        Jadwal Minggu Ini
                    </h2>
                    <p className="mt-4 text-xs text-slate-400">
                        Memuat jadwal...
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5">
                <h2 className="text-base font-semibold text-slate-800">
                    Jadwal Minggu Ini
                </h2>

                <button
                    type="button"
                    onClick={async () => {
                        setLoading(true);
                        setError("");

                        try {
                            const data = await getSchedules(token);
                            setSchedules(data);
                        } catch (err) {
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : "Gagal mengambil jadwal kuliah."
                            );
                            setSchedules([]);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="text-xs font-medium text-cyan-700 hover:underline"
                >
                    Muat ulang
                </button>
            </div>

            {/* Kalender mingguan */}
            <div className="px-4 pt-6">
                <div className="grid grid-cols-7 gap-y-1">
                    {weekDays.map((item) => {
                        const isSelected =
                            selectedDay?.date === item.date &&
                            selectedDay?.month === item.month &&
                            selectedDay?.year === item.year;

                        const hasSchedule = schedules.some(
                            (schedule) =>
                                normalizeDay(schedule.hari) ===
                                normalizeDay(item.fullDay)
                        );

                        return (
                            <button
                                key={`${item.year}-${item.month}-${item.date}`}
                                type="button"
                                onClick={() =>
                                    setSelectedDate(item.date)
                                }
                                aria-pressed={isSelected}
                                aria-label={`${item.fullDay}, ${item.date}`}
                                className="flex flex-col items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                            >
                                <span
                                    className={`text-xs ${
                                        isSelected
                                            ? "font-semibold text-cyan-600"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {item.day}
                                </span>

                                <span
                                    className={`mt-2 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                        isSelected
                                            ? "bg-cyan-600 text-white shadow-sm"
                                            : "text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    {item.date}
                                </span>

                                <span
                                    className={`mt-1.5 h-1 w-1 rounded-full ${
                                        hasSchedule && !isSelected
                                            ? "bg-cyan-600"
                                            : "bg-transparent"
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[10px] text-slate-400">
                    {dividerLabel}
                </span>

                <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Daftar jadwal */}
            <div className="space-y-3 px-4 pb-4">
                {error ? (
                    <div
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-5 text-center text-xs text-red-700"
                    >
                        {error}
                    </div>
                ) : selectedSchedules.length > 0 ? (
                    selectedSchedules.map((schedule, index) => (
                        <article
                            key={schedule.id}
                            className={`rounded-xl border-l-4 px-4 py-4 ${
                                index % 2 === 0
                                    ? "border-orange-400 bg-orange-50"
                                    : "border-cyan-600 bg-cyan-50/60"
                            }`}
                        >
                            <h3 className="break-words text-sm font-semibold leading-5 text-slate-800">
                                {schedule.nama_matkul} (
                                {schedule.kode_matkul})
                            </h3>

                            <ul className="mt-3 space-y-2 text-xs text-slate-500">
                                <li className="flex items-center gap-2">
                                    <BookIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">
                                        {schedule.nama_kelas}
                                    </span>
                                </li>

                                <li className="flex items-center gap-2">
                                    <ClockIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">
                                        {formatTime(schedule.jam_mulai)} -{" "}
                                        {formatTime(schedule.jam_selesai)}
                                    </span>
                                </li>

                                <li className="flex items-center gap-2">
                                    <PinIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">
                                        {schedule.ruangan || "-"}
                                    </span>
                                </li>
                            </ul>
                        </article>
                    ))
                ) : (
                    <div className="flex flex-col items-center rounded-xl bg-slate-50 py-8 text-slate-400">
                        <CalendarOffIcon />
                        <p className="mt-2 text-xs text-slate-500">
                            Tidak ada jadwal kuliah
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default CalendarSchedule;