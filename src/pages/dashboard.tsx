import Kalender from "../components/Kalendar/kalender";
import Tasktugas from "../components/Tugas/tasktugas";
import DashboardHero from "../components/DashboardHero";
import { taskData } from "../data/academicdata";
import type { UserProfile } from "../types/user";

function dashboard({ user }: { user: UserProfile }) {
    const pendingTasks = taskData.filter((task) => !task.completed).length;

    return (
        <div className="grid min-w-0 gap-5">
            <DashboardHero user={user} pendingTasks={pendingTasks} />
            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.35fr)]">
                <Tasktugas />
                <Kalender />
            </div>
        </div>
    );
}

export default dashboard;
