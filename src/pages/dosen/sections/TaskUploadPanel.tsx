import { useState, type FormEvent } from 'react';

export default function TaskUploadPanel() {
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [notice, setNotice] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(`Tugas "${title}" siap dipublikasikan${fileName ? ` dengan lampiran ${fileName}` : ''}.`);
    setTitle('');
    setFileName('');
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Materi kelas</p><h2 className="mt-1 text-lg font-semibold text-slate-900">Unggah tugas</h2>
      <form className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-slate-700">Nama tugas<input className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-emerald-600" onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Praktikum 1" required value={title} /></label>
        <label className="text-sm font-medium text-slate-700">Lampiran<input className="mt-2 block h-10 w-full rounded-lg border border-slate-300 text-xs text-slate-600 file:mr-3 file:h-full file:border-0 file:bg-slate-100 file:px-3" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} type="file" /></label>
        <button className="h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">Simpan tugas</button>
      </form>
      {notice && <p aria-live="polite" className="mt-3 text-sm text-emerald-700">{notice} (pratinjau lokal)</p>}
    </section>
  );
}