export function normalizePhoneNumber(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (!digits) return null;

  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  if (!/^62\d{8,13}$/.test(normalized)) return null;
  return normalized;
}

export function phoneNumberFromJid(jid: string): string | null {
  if (jid.endsWith('@g.us')) return null;
  const user = jid.split('@')[0]?.split(':')[0];
  return user ? normalizePhoneNumber(user) : null;
}
