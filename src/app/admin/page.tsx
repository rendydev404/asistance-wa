import { getSupabaseAdmin } from '@/lib/supabase';
import { Activity, ArrowUpRight, BookOpen, MessageCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import WhatsAppConnectionCard from './WhatsAppConnectionCard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabaseAdmin = getSupabaseAdmin();
  const { count: kbCount } = await supabaseAdmin
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  const { count: sessionCount } = await supabaseAdmin
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Control center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">WhatsApp assistant</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Pantau koneksi, isi pengetahuan, dan kontrol siapa yang boleh dijawab AI.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" /> Data tersinkron otomatis
        </div>
      </div>

      <WhatsAppConnectionCard />
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-3xl border border-white/8 bg-[#0e1c2d] p-4 sm:p-5">
          <div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-300/12 text-indigo-200"><Activity className="h-4 w-4" aria-hidden="true" /></span><span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Live</span></div>
          <p className="mt-5 text-2xl font-bold text-white">Aktif</p><p className="mt-1 text-xs text-slate-500">Mesin balas AI</p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-[#0e1c2d] p-4 sm:p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/12 text-violet-200"><BookOpen className="h-4 w-4" aria-hidden="true" /></span>
          <p className="mt-5 text-2xl font-bold text-white">{kbCount || 0}</p><p className="mt-1 text-xs text-slate-500">Fakta tersimpan</p>
        </div>
        <div className="col-span-2 rounded-3xl border border-white/8 bg-[#0e1c2d] p-4 sm:col-span-1 sm:p-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-300/12 text-indigo-200"><MessageCircle className="h-4 w-4" aria-hidden="true" /></span>
          <p className="mt-5 text-2xl font-bold text-white">{sessionCount || 0}</p><p className="mt-1 text-xs text-slate-500">Sesi percakapan</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Kelola cepat</p><h2 className="mt-1 text-lg font-semibold text-white">Yang perlu diatur</h2></div></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/knowledge" className="group flex min-h-20 items-center justify-between rounded-3xl border border-white/8 bg-[#0e1c2d] p-4 transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-[#12243a]">
            <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-300/12 text-indigo-200"><BookOpen className="h-5 w-5" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-white">Isi knowledge base</span><span className="mt-1 block text-xs text-slate-500">Tambah fakta agar jawaban lebih tepat</span></span></span><ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:text-indigo-200" aria-hidden="true" />
          </Link>
          <Link href="/admin/exclusions" className="group flex min-h-20 items-center justify-between rounded-3xl border border-white/8 bg-[#0e1c2d] p-4 transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-[#12243a]">
            <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-300/12 text-violet-200"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-white">Atur nomor pengecualian</span><span className="mt-1 block text-xs text-slate-500">Alihkan chat tertentu ke admin</span></span></span><ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:text-violet-200" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
