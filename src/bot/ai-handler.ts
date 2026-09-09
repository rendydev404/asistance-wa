import Groq from 'groq-sdk';
import { getSupabaseAdmin } from '../lib/supabase';

// Initialize Groq (Will need process.env.GROQ_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export class AIHandler {
    
    private async findRelevantFacts(message: string): Promise<string> {
        const { data, error } = await getSupabaseAdmin().rpc('search_knowledge', {
            query_text: message,
            match_count: 3,
        });

        if (error) throw error;
        if (!data?.length) return 'Tidak ada fakta spesifik ditemukan.';

        return data
            .map((item: { question: string | null; answer: string }) =>
                `Q: ${item.question || '-'}\nA: ${item.answer}`,
            )
            .join('\n\n');
    }

    /**
     * Generates a reply using Groq based on the message and relevant facts
     */
    public async generateReply(message: string): Promise<string> {
        try {
            const facts = await this.findRelevantFacts(message);
            
            const prompt = `
Anda adalah kloning digital dari pengguna bernama Rendy.
Gunakan gaya bahasa santai, ramah, dan manusiawi.
JIKA ada yang bertanya hal di luar fakta yang diberikan, jujur saja bahwa Anda (sebagai Rendy) sedang sibuk atau tidak ingat, JANGAN berhalusinasi.

FAKTA YANG DIKETAHUI:
${facts}

PERTANYAAN DARI TEMAN:
"${message}"

BALASAN ANDA (Sebagai Rendy):`;

            let retries = 3;
            let delay = 1500;
            
            while (retries > 0) {
                try {
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: "You are Rendy's AI clone." },
                            { role: "user", content: prompt }
                        ],
                        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
                        temperature: 0.7,
                        max_tokens: 500,
                    });
                    
                    return completion.choices[0]?.message?.content || "";
                } catch (error: unknown) {
                    const status = typeof error === 'object' && error !== null && 'status' in error
                        ? error.status
                        : undefined;
                    const message = error instanceof Error ? error.message : String(error);
                    if ((status === 503 || status === 429 || message.includes('503') || message.includes('429')) && retries > 1) {
                        console.log(`[AI] Server overloaded or rate limited. Retrying in ${delay/1000}s... (${retries - 1} retries left)`);
                        await new Promise(res => setTimeout(res, delay));
                        retries--;
                        delay *= 1.5; // Exponential backoff
                    } else {
                        throw error;
                    }
                }
            }
            
            throw new Error("Failed to generate AI reply after multiple retries");
            
        } catch (error) {
            console.error("Error generating AI reply:", error);
            throw error;
        }
    }
}
