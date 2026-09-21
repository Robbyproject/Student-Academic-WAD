import { useState } from "react";
import { scheduleData } from "../../data/academicdata";

/* ---------- Konfigurasi minggu (data dummy) ---------- */
const TODAY_DATE = 21;
const MONTH_LABEL = "September";

const weekDays = [
    { day: "Sen", fullDay: "Senin", date: 21 },
    { day: "Sel", fullDay: "Selasa", date: 22 },
    { day: "Rab", fullDay: "Rabu", date: 23 },
    { day: "Kam", fullDay: "Kamis", date: 24 },
    { day: "Jum", fullDay: "Jumat", date: 25 },
    { day: "Sab", fullDay: "Sabtu", date: 26 },
    { day: "Min", fullDay: "Minggu", date: 27 },
];


type IconProps = { className?: string };
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
        <svg {...iconBase} width={22} height={22} className={className}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

/* ---------- Komponen utama ---------- */
function CalendarSchedule() {
    const [selectedDate, setSelectedDate] = useState<number>(TODAY_DATE);

    const selectedSchedules = scheduleData.filter(
        (schedule) => schedule.date === selectedDate
    );

    const selectedDay = weekDays.find((item) => item.date === selectedDate);
    const dividerLabel =
        selectedDate === TODAY_DATE
            ? "Today"
            : `${selectedDay?.fullDay ?? ""}, ${selectedDate} ${MONTH_LABEL}`;

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="px-5 pt-5">
                <h2 className="text-base font-semibold text-slate-800">
                    Jadwal Minggu Ini
                </h2>
            </div>

            {/* Kalender mingguan */}
            <div className="px-4 pt-6">
                <div className="grid grid-cols-7 gap-y-1">
                    {weekDays.map((item) => {
                        const isSelected = selectedDate === item.date;
                        const hasSchedule = scheduleData.some(
                            (schedule) => schedule.date === item.date
                        );

                        return (
                            <button
                                key={item.date}
                                type="button"
                                onClick={() => setSelectedDate(item.date)}
                                aria-pressed={isSelected}
                                aria-label={`${item.fullDay}, ${item.date} ${MONTH_LABEL}`}
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
                {selectedSchedules.length > 0 ? (
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
                                {schedule.course} ({schedule.code})
                            </h3>

                            <ul className="mt-3 space-y-2 text-xs text-slate-500">
                                <li className="flex items-center gap-2">
                                    <BookIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">{schedule.session}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <ClockIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">{schedule.time}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <PinIcon className="shrink-0" />
                                    <span className="min-w-0 break-words">{schedule.room}</span>
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
