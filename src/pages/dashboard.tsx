import Kalender from "../components/kalender";
import Tasktugas from "../components/tasktugas";

function dashboard() {
    return (
        <main className="min-h-screen bg-slate-50 p-5">
            <div className="flex flex-col gap-5 md:flex-row">
                <Tasktugas /> 
                <Kalender />
                
            </div>
            
        </main>
    );
}

export default dashboard;
