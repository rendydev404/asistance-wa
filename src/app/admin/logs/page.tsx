import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const { data: messages } = await getSupabaseAdmin()
    .from('chat_messages')
    .select('message_id, phone_number, direction, text, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Chat Logs</h2>
        <p className="text-gray-600">100 pesan terakhir yang diterima atau dikirim bot.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(messages || []).map((message) => (
              <tr key={message.message_id}>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(message.created_at).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{message.phone_number}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{message.direction}</td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-pre-wrap">{message.text}</td>
              </tr>
            ))}
            {!messages?.length && (
              <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-500">Belum ada log.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
