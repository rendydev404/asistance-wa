import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!answer) {
      return NextResponse.json({ error: 'Jawaban wajid diisi' }, { status: 400 });
    }

    // Gabungkan text untuk di embed.
    const textToEmbed = `Pertanyaan: ${question || 'Informasi'}\nJawaban/Fakta: ${answer}`;

    // Get embedding dari Gemini
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(textToEmbed);
    const embedding = result.embedding.values;

    // Simpan ke Supabase
    const { data, error } = await supabaseAdmin
      .from('knowledge_base')
      .insert([
        { question, answer, embedding }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Embed API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
