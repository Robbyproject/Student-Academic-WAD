import { useState, type FormEvent } from 'react';

type Account = { name: string; email: string; role: string };

export default function UserManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('mahasiswa');
  const [notice, setNotice] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccounts((current) => [{ name, email, role }, ...current]);
    setNotice(`Akun ${role} untuk ${email} ditambahkan ke pratinjau lokal.`);
    setName('');
    setEmail('');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pengguna</p><h2 className="mt-1 text-lg font-semibold">Buat akun kampus</h2></div>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-slate-700">Nama<input className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600" onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label className="text-sm font-medium text-slate-700">Email<input className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-cyan-600" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label className="text-sm font-medium text-slate-700">Peran<select className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-600" onChange={(event) => setRole(event.target.value)} value={role}><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option></select></label>
        <button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700" type="submit">Buat akun</button>
      </form>
      {notice && <p aria-live="polite" className="mt-3 text-sm text-cyan-800">{notice}</p>}
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="border-y border-slate-200 text-xs text-slate-500"><tr><th className="py-3 font-medium">Nama</th><th className="py-3 font-medium">Email</th><th className="py-3 font-medium">Peran</th></tr></thead><tbody>{accounts.length ? accounts.map((account, index) => <tr className="border-b border-slate-100" key={`${account.email}-${index}`}><td className="py-3 font-medium">{account.name}</td><td className="py-3 text-slate-600">{account.email}</td><td className="py-3 capitalize text-slate-600">{account.role}</td></tr>) : <tr><td className="py-5 text-slate-500" colSpan={3}>Belum ada akun baru pada sesi ini.</td></tr>}</tbody></table></div>
      <p className="mt-3 text-xs text-slate-400">Data akun saat ini hanya pratinjau lokal.</p>
    </section>
  );
}