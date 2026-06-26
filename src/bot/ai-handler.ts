import Groq from 'groq-sdk';

// Initialize Groq (Will need process.env.GROQ_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export class AIHandler {
    
    /**
     * Searches for relevant facts in Supabase based on the user's message
     */
    private async findRelevantFacts(message: string): Promise<string> {
        // TODO: Implement Supabase vector search using pgvector
        // For now, return a placeholder string or empty
        return "Fakta: Ini adalah prototipe asisten AI Rendy.";
    }

    /**
     * Generates a reply using Google Gemini based on the message and relevant facts
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

            let retries = 5;
            let delay = 3000;
            
            while (retries > 0) {
                try {
                    const completion = await groq.chat.completions.create({
                        messages: [
                            { role: "system", content: "You are Rendy's AI clone." },
                            { role: "user", content: prompt }
                        ],
                        model: "llama-3.3-70b-versatile",
                        temperature: 0.7,
                    });
                    
                    return completion.choices[0]?.message?.content || "";
                } catch (error: any) {
                    if ((error?.status === 503 || error?.status === 429 || error?.message?.includes("503") || error?.message?.includes("429")) && retries > 1) {
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
