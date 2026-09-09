# Rencana Implementasi: AI Assistant WhatsApp Pribadi

Berikut adalah rencana langkah demi langkah untuk membangun sistem AI sesuai dengan desain kita:

## Fase 1: Setup Proyek & Dependensi
- [ ] Inisialisasi proyek Next.js 16 (App Router, Tailwind CSS, TypeScript).
- [ ] Install library yang dibutuhkan (`@supabase/supabase-js`, `groq-sdk`, ikon UI, dll).
- [ ] Konfigurasi variabel lingkungan (Environment Variables) seperti URL Supabase, API Key Groq, dan secret admin.

## Fase 2: Database & Supabase (Skema & Fungsi)
- [ ] Membuat file SQL untuk inisialisasi tabel di Supabase (full-text search PostgreSQL).
- [ ] Membuat tabel `knowledge_base` (untuk menyimpan tanya-jawab dan vektor).
- [ ] Membuat tabel `chat_sessions` (untuk melacak percakapan dan status 10s/3s handover).
- [ ] Membuat fungsi *Full-Text Search* di Supabase (`search_knowledge`).

## Fase 3: Pembuatan Antarmuka Admin (Admin UI)
- [ ] Membuat Layout halaman Admin dan Navigasi.
- [ ] Membuat Halaman Dashboard (Status singkat).
- [ ] Membuat Halaman Knowledge Base (Formulir tambah data, daftar data).
- [ ] Membuat Halaman Pengaturan Persona (Prompt Utama).

## Fase 4: Logika Backend & Integrasi AI (API Routes)
- [ ] Membuat endpoint `POST /api/knowledge/embed` untuk menyimpan fakta ke Supabase.
- [ ] Menjalankan proses Baileys Native sebagai pintu masuk pesan WhatsApp.
- [ ] Mengimplementasikan *State Management* obrolan dan handover 10 detik.
- [ ] Mengimplementasikan retrieval PostgreSQL, susun prompt, panggil Groq, dan kirim balasan melalui Baileys.

## Fase 5: Finalisasi & Pengujian
- [ ] Menguji alur penambahan Knowledge Base.
- [ ] Menyiapkan webhook tiruan (Mock Webhook) untuk memastikan logika balas-membalas bekerja.
- [ ] Dokumentasi cara *deploy* dan menyambungkan webhook sesungguhnya.
