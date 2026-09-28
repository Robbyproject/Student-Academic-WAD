import { useState, type FormEvent } from 'react';

type LoginPageProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <section className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#94a3b8 0.7px, transparent 0.7px)', backgroundSize: '22px 22px' }} />
        <div className="relative flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400 font-bold text-slate-950">SA</div><span className="text-sm font-semibold tracking-wide">STUDENT ACADEMIC</span></div>
        <div className="relative max-w-xl pb-10"><p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Portal Akademik</p><h1 className="text-5xl font-semibold leading-tight">Satu ruang untuk kegiatan kampus.</h1><p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Masuk menggunakan akun kampus untuk membuka layanan sesuai peran Anda.</p></div>
        <p className="relative text-xs text-slate-400">Mahasiswa · Dosen · Staf kampus</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><div className="mb-6 grid h-11 w-11 place-items-center rounded-xl bg-cyan-500 font-bold text-slate-950">SA</div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Student Academic</p></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Selamat datang</p><h2 className="mt-2 text-3xl font-semibold text-slate-900">Masuk ke akun</h2><p className="mt-2 text-sm text-slate-500">Gunakan email dan kata sandi akun kampus Anda.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">Email<input autoComplete="username" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" onChange={(event) => setEmail(event.target.value)} placeholder="nama@kampus.ac.id" required type="email" value={email} /></label>
            <label className="block text-sm font-medium text-slate-700">Kata sandi<input autoComplete="current-password" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
            {error && <p aria-live="polite" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60" disabled={isLoading} type="submit">{isLoading ? 'Memeriksa akun...' : 'Masuk'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}