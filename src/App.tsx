import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import type { UserProfile } from './types/user';
import { login, logout, type AuthSession } from './api/auth';
import LoginPage from './components/Auth/LoginPage';
import { Navbar } from './components/Navbar';
import Sidebar from './components/Sidebar';
import type { Course } from './sections/Kelas/Page';

const DataDiri = lazy(() =>
  import('./pages/DataDiri').then((module) => ({
    default: module.DataDiri,
  }))
);

const Dashboard = lazy(() => import('./pages/dashboard'));
const Kelas = lazy(() => import('./sections/Kelas/Page'));
const KelasDetail = lazy(() =>
  import('./sections/Kelas/KelasDetail/Page')
);
const LecturerDashboard = lazy(() => import('./pages/dosen/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

export type ActivePage = 'dashboard' | 'profile';

function getStoredPage(): ActivePage {
  return sessionStorage.getItem('academic-active-page') === 'profile'
    ? 'profile'
    : 'dashboard';
}

function PageSkeleton() {
  return (
    <div
      aria-label="Memuat halaman"
      className="mx-auto grid w-full max-w-[1440px] animate-pulse grid-cols-1 items-start gap-5 bg-slate-50 px-3 py-5 sm:px-5 lg:grid-cols-[clamp(190px,20vw,260px)_minmax(0,1fr)] lg:px-6"
    >
      <div className="space-y-5">
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-7 w-full rounded bg-slate-100" />

        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-36 rounded-lg bg-slate-200"
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      aria-label="Memuat detail kelas"
      className="mx-auto w-full max-w-[1440px] animate-pulse bg-slate-50 px-3 py-5 sm:px-5 lg:px-6"
    >
      <div className="mb-4 h-9 w-32 rounded-lg bg-slate-200" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="h-28 bg-slate-300 sm:h-36" />

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="space-y-2" key={index}>
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-5 w-20 rounded bg-slate-200" />

        <div className="mt-5 grid gap-5 md:grid-cols-[130px_minmax(0,1fr)]">
          <div className="mx-auto h-28 w-28 rounded-full border-[18px] border-slate-200" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="h-20 rounded-lg bg-slate-200"
                key={index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 h-11 rounded-xl border border-slate-200 bg-white" />

      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-16 rounded-xl border border-slate-200 bg-white"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

function StudentPortal({ user, onLogout }: { user: UserProfile; onLogout: () => void }) {
  const [activePage, setActivePage] =
    useState<ActivePage>(getStoredPage);

  // Data kelas berasal dari API Laravel,
  // tidak mengambil lagi dari matkul.json.
  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = contentScrollRef.current;
    const content = contentInnerRef.current;

    if (!wrapper || !content) {
      return undefined;
    }

    const lenis = new Lenis({
      wrapper,
      content,
      autoRaf: false,
      smoothWheel: true,
    });

    let animationFrame = 0;

    const animate = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      'academic-active-page',
      activePage
    );
  }, [activePage]);

  useEffect(() => {
    if (selectedCourse) {
      sessionStorage.setItem(
        'academic-selected-course',
        selectedCourse.id
      );
    } else {
      sessionStorage.removeItem(
        'academic-selected-course'
      );
    }
  }, [selectedCourse]);

  function handleNavigate(page: ActivePage) {
    setActivePage(page);

    if (page === 'dashboard') {
      setSelectedCourse(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-800 lg:h-screen lg:overflow-hidden">
      <Navbar
        user={user}
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />

      <main className="grid min-h-0 w-full flex-1 grid-cols-1 items-stretch gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
        />

        <div
          className="scrollbar-hidden min-h-0 min-w-0 px-3 py-5 sm:px-0 lg:overflow-y-auto lg:px-5 lg:py-6"
          ref={contentScrollRef}
        >
          <div ref={contentInnerRef}>
            <Suspense
              fallback={
                selectedCourse ? (
                  <DetailSkeleton />
                ) : (
                  <PageSkeleton />
                )
              }
            >
              {activePage === 'profile' ? (
                <DataDiri initialData={user} />
              ) : selectedCourse ? (
                <KelasDetail
                  course={selectedCourse}
                  onBack={() => setSelectedCourse(null)}
                />
              ) : (
                <div className="grid min-w-0 gap-5">
                  <Dashboard user={user} />

                  <Kelas
                    onCourseSelect={setSelectedCourse}
                  />
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function getStoredSession(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem('academic-auth-session');
    if (!stored) return null;
    const session = JSON.parse(stored) as AuthSession;
    if (!session.user || !['mahasiswa', 'dosen', 'admin'].includes(session.role)) return null;
    return session;
  } catch {
    sessionStorage.removeItem('academic-auth-session');
    return null;
  }
}

export function App() {
  const [session, setSession] = useState<AuthSession | null>(getStoredSession);

  async function handleLogin(email: string, password: string) {
    const nextSession = await login({ email, password });
    sessionStorage.setItem('academic-auth-session', JSON.stringify(nextSession));
    setSession(nextSession);
  }

  async function handleLogout() {
    const logoutRequest = logout(session?.token ?? null).catch(() => undefined);
    sessionStorage.removeItem('academic-auth-session');
    setSession(null);
    await logoutRequest;
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Memuat dashboard...</div>}>
      {session.role === 'mahasiswa' ? (
        <StudentPortal user={session.user} onLogout={handleLogout} />
      ) : session.role === 'dosen' ? (
        <LecturerDashboard user={session.user} onLogout={handleLogout} />
      ) : (
        <AdminDashboard user={session.user} onLogout={handleLogout} />
      )}
    </Suspense>
  );
}

export default App;