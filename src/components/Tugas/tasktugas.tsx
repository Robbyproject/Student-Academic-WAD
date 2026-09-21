import { taskData } from "../../data/academicdata";

/* ---------- Helper ---------- */
// Parse "YYYY-MM-DD" sebagai tanggal lokal (menghindari bug zona waktu dari new Date("YYYY-MM-DD"))
function parseLocalDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
}

function ClockIcon() {
    return (
        <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}

function NotePencilIcon() {
    return (
        <svg
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L12 14.8 8 16l1.2-4z" />
            <path d="M7 8h4M7 12h1" />
        </svg>
    );
}

function TaskTugas() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTasks = taskData.filter((task) => {
        const deadline = parseLocalDate(task.deadline);
        return !task.completed && deadline >= today;
    });

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 pt-5 pb-4">
                <h2 className="min-w-0 break-words text-base font-semibold text-slate-800">
                    Tugas Belum Dikumpulkan
                </h2>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">
                    {activeTasks.length}
                </span>
            </div>

            <div className="mx-5 h-px bg-slate-100" />

            {/* Isi */}
            <div className="p-4">
                {activeTasks.length > 0 ? (
                    <div className="space-y-3">
                        {activeTasks.map((task) => {
                            const formattedDeadline = parseLocalDate(
                                task.deadline
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            });

                            return (
                                <article
                                    key={task.id}
                                    className="rounded-xl border-l-4 border-orange-400 bg-orange-50 px-4 py-4"
                                >
                                    <h3 className="break-words text-sm font-semibold leading-5 text-slate-800">
                                        {task.title}
                                    </h3>
                                    <p className="mt-1 break-words text-xs text-slate-500">
                                        {task.course}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                                        <ClockIcon />
                                        <span className="break-words">Deadline {formattedDeadline}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200/70 text-slate-400">
                            <NotePencilIcon />
                        </div>
                        <p className="mt-4 text-xs text-slate-500">
                            Tidak ada tugas yang perlu dikumpulkan
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default TaskTugas;