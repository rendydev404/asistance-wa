import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Konfigurasi agar fungsi serverless tidak timeout (Vercel mengizinkan up to 60s di Hobby)
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Ambil prompt dari database di dalam function nanti
const DEFAULT_SYSTEM_PROMPT = `Kamu adalah asisten pribadi. Balaslah dengan gaya kasual.
Fakta: {context}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Pastikan ini adalah event pesan masuk (Evolution API format: message.upsert)
    // dan bukan dari kita sendiri (fromMe: false).
    // Sesuaikan pengecekan sesuai bentuk payload Evolution API spesifik.
    const messageData = payload?.data?.message;
    const key = payload?.data?.key;
    
    if (!messageData || key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Ambil isi teks pesan (Evolution API bisa menyimpan teks di conversation, extendedTextMessage, dll)
    const textMessage = messageData?.conversation || 
                        messageData?.extendedTextMessage?.text || '';

    if (!textMessage) {
      return NextResponse.json({ status: 'ignored - no text' });
    }

    const remoteJid = key.remoteJid;

    // 1. Cek State Management di Supabase
    const { data: session } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('phone_number', remoteJid)
      .single();

    const now = new Date();
    let isNewSession = false;
    let currentStatus = 'waiting';

    if (!session) {
      // Sesi baru, buat data baru
      isNewSession = true;
      await supabaseAdmin.from('chat_sessions').insert([
        { phone_number: remoteJid, status: 'waiting', last_message_at: now.toISOString() }
      ]);
    } else {
      // Cek apakah jeda dari pesan terakhir sudah sangat lama (misal > 1 jam), anggap sesi baru
      const lastMsgTime = new Date(session.last_message_at).getTime();
      const diffHours = (now.getTime() - lastMsgTime) / (1000 * 60 * 60);
      
      if (diffHours > 1 || session.status === 'human') {
         isNewSession = true;
         // Reset jadi waiting jika sebelumnya human atau sudah lama
         await supabaseAdmin.from('chat_sessions')
           .update({ status: 'waiting', last_message_at: now.toISOString() })
           .eq('phone_number', remoteJid);
      } else {
        currentStatus = session.status;
        await supabaseAdmin.from('chat_sessions')
           .update({ last_message_at: now.toISOString() })
           .eq('phone_number', remoteJid);
      }
    }

    // 2. Logika Jeda (Wait)
    const waitTime = isNewSession ? 10000 : 3000; // 10s atau 3s
    await sleep(waitTime);

    // 3. Setelah jeda, cek kembali status di database
    // Jika dalam 10s/3s pengguna membalas via HP, webhook lain akan menangkap pesan fromMe:true
    // (Bisa dikonfigurasi di luar API ini untuk mengupdate status menjadi 'human').
    // Untuk keamanan ganda, kita cek status terbaru:
    const { data: latestSession } = await supabaseAdmin
      .from('chat_sessions')
      .select('status')
      .eq('phone_number', remoteJid)
      .single();

    if (latestSession && latestSession.status === 'human') {
      return NextResponse.json({ status: 'aborted - taken over by human' });
    }

    // Ubah status ke AI Active jika tadi menunggu
    if (latestSession?.status === 'waiting') {
       await supabaseAdmin.from('chat_sessions')
         .update({ status: 'ai_active' })
         .eq('phone_number', remoteJid);
    }

    // 4. Proses AI: Generate Embedding dari pertanyaan
    const embedModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embedResult = await embedModel.embedContent(textMessage);
    const queryEmbedding = embedResult.embedding.values;

    // 5. Cari di Knowledge Base (Vector Search)
    // Parameter di match_knowledge: query_embedding, match_threshold, match_count
    const { data: kbMatches } = await supabaseAdmin.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.6, // Minimal similarity 60%
      match_count: 3 // Ambil top 3 fakta
    });

    // Susun context text dari hasil pencarian
    let contextText = 'Tidak ada fakta spesifik ditemukan.';
    if (kbMatches && kbMatches.length > 0) {
      contextText = kbMatches.map((match: any) => `Q: ${match.question || '-'}\nA: ${match.answer}`).join('\n\n');
    }

    // Ambil System Prompt dari DB
    const { data: settingData } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'system_prompt')
      .single();
    
    const basePrompt = settingData?.value || DEFAULT_SYSTEM_PROMPT;
    const finalPrompt = basePrompt.replace('{context}', contextText);
    // 6. Generate Balasan dengan Gemini
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // (Bisa dikembangkan dengan history percakapan. Saat ini single-turn + RAG context)
    const chat = chatModel.startChat({
      history: [
        { role: 'user', parts: [{ text: finalPrompt }] },
        { role: 'model', parts: [{ text: 'Baik, saya mengerti. Saya akan menggunakan fakta tersebut untuk menjawab pertanyaan selanjutnya, atau jujur jika tidak tahu.' }] }
      ]
    });

    const aiResult = await chat.sendMessage(textMessage);
    const replyText = aiResult.response.text();

    // 7. Kirim balasan ke Evolution API
    const evoUrl = process.env.EVOLUTION_API_URL;
    const evoKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    if (evoUrl && evoKey && instanceName) {
      const waNumber = remoteJid.split('@')[0];
      await fetch(`${evoUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evoKey
        },
        body: JSON.stringify({
          number: waNumber,
          text: replyText
        })
      });
    } else {
      console.log('Evolution API variables not fully set. AI Reply:', replyText);
    }

    return NextResponse.json({ status: 'replied', text: replyText });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    // Silent fail agar AI tidak membalas error ke chat
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
