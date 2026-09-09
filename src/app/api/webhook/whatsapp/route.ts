import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  return NextResponse.json(
    { error: 'Evolution API webhook disabled. The Baileys bot is the only WhatsApp adapter.' },
    { status: 410 },
  );
}
