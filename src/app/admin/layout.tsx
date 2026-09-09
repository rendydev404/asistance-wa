import Link from 'next/link';
import { Bot, ExternalLink } from 'lucide-react';
import LogoutButton from './LogoutButton';
import AdminNav from './AdminNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100 md:flex">
      <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-[#091625] p-5 md:flex md:flex-col">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-300 text-slate-950 shadow-lg shadow-teal-300/10">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Asist WA</p>
            <p className="text-xs text-slate-500">Admin console</p>
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">Live workspace</p>
          <p className="mt-2 text-sm leading-5 text-slate-300">Pantau koneksi dan atur perilaku AI dari satu tempat.</p>
          <div className="mt-4 flex items-center justify-between">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white hover:text-teal-200">
              Buka aplikasi <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/8 bg-[#091625]/80 px-4 py-4 backdrop-blur md:hidden">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-300 text-slate-950"><Bot className="h-5 w-5" aria-hidden="true" /></span>
            <span className="text-sm font-semibold text-white">Asist WA</span>
          </Link>
          <LogoutButton />
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 sm:px-6 md:px-10 md:py-10 lg:px-14">
        {children}
        </main>
        <AdminNav />
      </div>
    </div>
  );
}
