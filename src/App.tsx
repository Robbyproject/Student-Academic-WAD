<<<<<<< HEAD
import Dashboard from "./pages/dashboard";
import "./App.css";

function App() {
    return (
        <Dashboard />
    );
=======
import { useState } from 'react';
import type { UserProfile } from './types/user';
import { Navbar } from './components/Navbar';
import { DataDiri } from './pages/DataDiri';

export function App() {
  const [user] = useState<UserProfile>({
    nama: 'ARYA RIZA PRATAMA',
    nim: '25110300031',
    prodi: 'Ilmu Komputer',
    email: 'aryarizapratama25@gmail.com',
    noTelepon: '85892927717',
    jenisKelamin: 'Laki-laki',
  });

  const [activePage, setActivePage] = useState<'dashboard' | 'profile'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar 
        user={user} 
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)} 
      />

      <main className="py-6">
        {activePage === 'profile' ? (
          <DataDiri initialData={user} />
        ) : (
          <div></div>
        )}
      </main>
    </div>
  );
>>>>>>> origin/arya-branch
}

export default App;