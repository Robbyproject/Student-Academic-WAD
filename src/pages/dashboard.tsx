import { useState } from "react";
import Kalender from "../components/Kalendar/kalender";
import Tasktugas from "../components/Tugas/tasktugas";
import DashboardHero from "../components/DashboardHero";
import { taskData } from "../data/academicdata";
import type { UserProfile } from "../types/user";

function Dashboard({
    user,
    token,
}: {
    user: UserProfile;
    token: string | null;
}) {
    // State untuk melacak apakah detail tugas sedang dibuka
    const [isOpeningTaskDetail, setIsOpeningTaskDetail] = useState(false);

    const pendingTasks = taskData.filter((task) => !task.completed).length;

    return (
        <div className="grid min-w-0 gap-5">
            {/* Hero disembunyikan saat detail tugas dibuka agar tampilannya benar-benar bersih seperti halaman penuh */}
            {!isOpeningTaskDetail && <DashboardHero user={user} pendingTasks={pendingTasks} />}

            {/* Grid utama yang menyesuaikan saat tugas diklik */}
            <div className={`grid min-w-0 gap-5 ${isOpeningTaskDetail ? 'xl:grid-cols-1' : 'xl:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.35fr)]'}`}>
                
                {/* Tasktugas diperluas dan dikirimkan fungsi callback onSelectTask */}
                <div className="min-w-0">
                    <Tasktugas 
                        mahasiswaId={user.mahasiswaId} 
                        token={token} 
                        onSelectTask={(isOpening) => setIsOpeningTaskDetail(isOpening)}
                    />
                </div>

                {/* Kalender otomatis disembunyikan (hidden) saat detail tugas sedang dibuka */}
                {!isOpeningTaskDetail && (
                    <div className="min-w-0">
                        <Kalender token={token} />
                    </div>
                )}

            </div>
        </div>
    );
}

export default Dashboard;