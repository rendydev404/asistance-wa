# Rendy WhatsApp AI

Admin panel Next.js dan bot WhatsApp Baileys yang berjalan sebagai dua container di VPS. Groq digunakan untuk generate balasan; knowledge base dicari menggunakan PostgreSQL full-text search.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Menjalankan dengan Docker di VPS

1. Salin `.env.example` menjadi `.env`, lalu isi Supabase, Groq, dan secret admin.
2. Jalankan `supabase_schema.sql` di SQL Editor Supabase.
3. Build dan jalankan container:

```bash
docker compose up -d --build
docker compose logs -f bot
```

4. Buka `http://IP-VPS:3000`, login, lalu kelola Knowledge Base.
5. Scan QR yang tampil di log bot dari WhatsApp → Linked devices.

Auth Baileys disimpan di volume Docker `baileys_auth`, sehingga restart container tidak meminta QR ulang. Jangan menghapus volume tersebut kecuali ingin login ulang.

Untuk production, gunakan reverse proxy HTTPS di depan port 3000 dan batasi port VPS menggunakan firewall.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
