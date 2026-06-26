# Rencana Implementasi: AI Assistant WhatsApp Pribadi

Berikut adalah rencana langkah demi langkah untuk membangun sistem AI sesuai dengan desain kita:

## Fase 1: Setup Proyek & Dependensi
- [ ] Inisialisasi proyek Next.js 16 (App Router, Tailwind CSS, TypeScript).
- [ ] Install library yang dibutuhkan (`@supabase/supabase-js`, `@google/generative-ai`, ikon UI, dll).
- [ ] Konfigurasi variabel lingkungan (Environment Variables) seperti URL Supabase, API Key Gemini, dan URL Evolution API.

## Fase 2: Database & Supabase (Skema & Fungsi)
- [ ] Membuat file SQL untuk inisialisasi tabel di Supabase (ekstensi `pgvector`).
- [ ] Membuat tabel `knowledge_base` (untuk menyimpan tanya-jawab dan vektor).
- [ ] Membuat tabel `chat_sessions` (untuk melacak percakapan dan status 10s/3s handover).
- [ ] Membuat fungsi *Vector Search* di Supabase (PL/pgSQL `match_knowledge`).

## Fase 3: Pembuatan Antarmuka Admin (Admin UI)
- [ ] Membuat Layout halaman Admin dan Navigasi.
- [ ] Membuat Halaman Dashboard (Status singkat).
- [ ] Membuat Halaman Knowledge Base (Formulir tambah data, daftar data).
- [ ] Membuat Halaman Pengaturan Persona (Prompt Utama).

## Fase 4: Logika Backend & Integrasi AI (API Routes)
- [ ] Membuat endpoint `POST /api/knowledge/embed` (Saat admin menambah data KB, kita *embed* teksnya menggunakan Gemini dan simpan ke Supabase).
- [ ] Membuat endpoint `POST /api/webhook/whatsapp` (Pintu masuk pesan dari Evolution API).
- [ ] Mengimplementasikan *State Management* obrolan (Cek & Update tabel `chat_sessions`, logika jeda 10 detik / 3 detik).
- [ ] Mengimplementasikan *Retrieval-Augmented Generation* (RAG): Cari konteks di KB, susun Prompt, panggil Gemini, dan kembalikan pesan ke Evolution API.

## Fase 5: Finalisasi & Pengujian
- [ ] Menguji alur penambahan Knowledge Base.
- [ ] Menyiapkan webhook tiruan (Mock Webhook) untuk memastikan logika balas-membalas bekerja.
- [ ] Dokumentasi cara *deploy* dan menyambungkan webhook sesungguhnya.
