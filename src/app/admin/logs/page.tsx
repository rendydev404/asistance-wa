import { getSupabaseAdmin } from '@/lib/supabase';
import { ArrowDownLeft, ArrowUpRight, MessageSquareText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const { data: messages } = await getSupabaseAdmin()
    .from('chat_messages')
    .select('message_id, phone_number, direction, text, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Jejak percakapan</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Chat logs</h1><p className="mt-2 text-sm leading-6 text-slate-400">100 pesan terakhir yang masuk dan keluar dari bot.</p>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[#0e1c2d]">
        <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/12 text-violet-200"><MessageSquareText className="h-4 w-4" aria-hidden="true" /></span><div><h2 className="font-semibold text-white">Aktivitas terbaru</h2><p className="text-xs text-slate-500">Diperbarui saat halaman dibuka</p></div></div>
        <div className="divide-y divide-white/8 md:hidden">
          {(messages || []).map((message) => <article key={message.message_id} className="p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-400">{new Date(message.created_at).toLocaleString('id-ID')}</span><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${message.direction === 'inbound' ? 'bg-violet-300/12 text-violet-200' : 'bg-indigo-300/12 text-indigo-200'}`}>{message.direction === 'inbound' ? <ArrowDownLeft className="h-3 w-3" aria-hidden="true" /> : <ArrowUpRight className="h-3 w-3" aria-hidden="true" />}{message.direction}</span></div><p className="mt-3 text-xs font-bold tracking-wide text-indigo-200">{message.phone_number}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{message.text}</p></article>)}
          {!messages?.length && <p className="p-6 text-center text-sm text-slate-500">Belum ada log percakapan.</p>}
        </div>
        <table className="hidden min-w-full divide-y divide-white/8 md:table">
          <thead className="bg-white/4">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Waktu</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Nomor</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Arah</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Pesan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {(messages || []).map((message) => (
              <tr key={message.message_id}>
                <td className="px-6 py-5 text-sm text-slate-500">{new Date(message.created_at).toLocaleString('id-ID')}</td><td className="px-6 py-5 text-sm text-slate-200">{message.phone_number}</td><td className="px-6 py-5 text-sm text-slate-300">{message.direction}</td><td className="whitespace-pre-wrap px-6 py-5 text-sm leading-6 text-slate-300">{message.text}</td>
              </tr>
            ))}
            {!messages?.length && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada log percakapan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
