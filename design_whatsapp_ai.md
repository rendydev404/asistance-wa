# Desain Sistem: AI Assistant WhatsApp Pribadi

## 1. Understanding Summary (Ringkasan Pemahaman)
- **Apa yang dibangun:** Asisten AI WhatsApp pribadi ("Digital Clone") dengan panel admin berbasis web untuk mengelola Knowledge Base.
- **Tujuan:** Membalas pesan WhatsApp secara otomatis (24/7) dengan meniru kepribadian dan gaya bahasa pengguna.
- **Target pengguna:** Semua orang yang menghubungi pengguna, dan pengguna sendiri sebagai admin.
- **Batasan utama:** Jika ditanya sesuatu di luar Knowledge Base, AI akan jujur tidak tahu namun tetap menggunakan gaya bahasa khas pengguna.
- **Bukan tujuan (Non-goals):** AI dilarang keras berhalusinasi atau mengarang fakta penting, dan bukan bot layanan pelanggan kaku.

## 2. Assumptions (Asumsi & Kebutuhan Non-Fungsional)
- **Skala & Trafik:** Volume chat tingkat personal (ratusan hingga ribuan pesan per hari).
- **Performa:** Waktu respons sekitar 2-5 detik, cukup untuk mensimulasikan waktu mengetik manusia.
- **Keamanan:** Admin panel di Next.js dilindungi autentikasi agar hanya pengguna yang bisa mengakses Knowledge Base. Data di Supabase diproteksi menggunakan RLS.
- **Arsitektur:** Menggunakan library **Baileys (Node.js)** secara *native*. Bot berjalan sebagai proses independen/terpisah dari Next.js untuk menjaga koneksi WebSocket secara persisten. Deploy *bot* akan dilakukan di VPS atau platform persisten (tidak bisa Vercel Serverless).

## 3. Decision Log (Log Keputusan)
- **Peran AI:** Ditetapkan sebagai "Digital Clone" (ngobrol santai) daripada bot profesional.
- **Ruang Lingkup Balasan:** Membalas semua nomor (termasuk yang tidak tersimpan).
- **Penanganan Edge Case:** AI tidak akan berimprovisasi jika tidak tahu, melainkan jujur tidak tahu dengan gaya bahasa pengguna.
- **Arsitektur Sistem:** Menggunakan **Baileys Native** sebagai satu-satunya adapter WhatsApp. Menjalankan script Node.js secara persisten (`npm run bot`) bersamaan dengan aplikasi Next.js (Admin UI) dalam container terpisah. Keduanya berbagi database Supabase yang sama.
- **Logika Jeda Waktu (Handover):** Jika obrolan baru, sistem menunggu **10 detik**. Jika pengguna tidak membalas secara manual, AI mengambil alih. Jika pengguna (Admin) membalas dari HP dalam rentang waktu tersebut, AI akan membatalkan *reply*-nya secara otomatis.

## 4. Final Design (Desain Sistem Akhir)

### A. Komponen Utama & Alur Data
1. **Baileys Bot (Backend Khusus):** Script Node.js yang bertugas menjaga WebSocket WhatsApp, menghasilkan QR Code (di terminal), membaca pesan masuk (`messages.upsert`), menjalankan timer 10s, mencari fakta ke Supabase, dan berinteraksi dengan API Groq.
2. **Next.js 16 (App Router):** Bertindak murni sebagai Frontend (Admin UI) untuk mengelola Knowledge Base dan pengaturan.
3. **Supabase & pgvector:** Database relasional penyimpan log chat, sesi pengguna, dan vektor embedding dari Knowledge Base.
4. **Groq API:** LLM untuk menghasilkan teks (*chat completion*). Retrieval fakta dilakukan PostgreSQL full-text search karena Groq tidak menyediakan embedding API.

### B. State Management (Logika 10 Detik)
- **Timer In-Memory:** Saat pesan masuk, *bot* Baileys memulai timer 10 detik di memori. Jika dalam rentang waktu ini masuk pesan baru dari `fromMe: true` (Admin membalas sendiri dari HP), maka timer untuk orang tersebut dibatalkan (AI bungkam). Jika tidak ada balasan dari Admin, maka AI akan mengambil konteks dan membalasnya.

### C. Knowledge Base (RAG Pipeline)
- Admin memasukkan teks fakta ke antarmuka Next.js.
- Fakta disimpan di tabel Supabase dengan kolom `tsvector` dan index GIN.
- Saat ada pertanyaan masuk di WhatsApp, bot Baileys memanggil fungsi `search_knowledge` untuk melakukan PostgreSQL full-text search. Fakta relevan digabungkan bersama *System Prompt* ke Groq untuk di-*generate* jawabannya.

### D. Fitur Admin & Error Handling
- **Admin UI:** Terdapat Knowledge Base Manager (CRUD), Persona Editor, dan log obrolan AI *read-only*.
- **Error Handling:** Baileys secara otomatis me-reconnect jika putus. Jika API Groq atau Supabase gagal/timeout, Bot akan membatalkan pembalasan (AI diam) agar terhindar dari pengiriman pesan *error message* yang kaku ke lawan bicara.
