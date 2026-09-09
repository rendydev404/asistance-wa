import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState as loadAuthState,
  type WASocket,
  type WAMessage,
} from '@whiskeysockets/baileys';
import { fetchLatestWaWebVersion } from '@whiskeysockets/baileys/lib/Utils/generics.js';
import pino from 'pino';
import QRCode from 'qrcode';
import * as qrcode from 'qrcode-terminal';
import { updateWhatsAppConnection } from './connection-store';
import { isPhoneExcluded } from './exclusion-store';
import { AIHandler } from './ai-handler';
import { SessionStore } from './session-store';
import { StateManager } from './state-manager';

const stateManager = new StateManager();
const aiHandler = new AIHandler();
const sessionStore = new SessionStore();
const botMessageIds = new Set<string>();

function getText(message: WAMessage): string | undefined {
  return message.message?.conversation || message.message?.extendedTextMessage?.text || undefined;
}

async function handleMessage(sock: WASocket, msg: WAMessage) {
  const remoteJid = msg.key.remoteJid;
  const messageId = msg.key.id;
  if (!remoteJid || !messageId || !msg.message) return;

  const textMessage = getText(msg);
  if (!textMessage) return;

  if (await isPhoneExcluded(remoteJid)) {
    console.log(`[BOT] AI excluded for WhatsApp number ${remoteJid}`);
    await sessionStore.markHuman(remoteJid);
    return;
  }

  if (msg.key.fromMe) {
    if (botMessageIds.delete(messageId)) return;

    stateManager.humanTookOver(remoteJid);
    await sessionStore.markHuman(remoteJid);
    await sessionStore.recordMessage({
      messageId,
      phoneNumber: remoteJid,
      text: textMessage,
      direction: 'outbound',
    });
    console.log(`[BOT] Human takeover for ${remoteJid}`);
    return;
  }

  console.log(`[BOT] Received message from ${remoteJid}: ${textMessage}`);
  await sessionStore.recordMessage({
    messageId,
    phoneNumber: remoteJid,
    text: textMessage,
    direction: 'inbound',
  });
  await sessionStore.startWaiting(remoteJid, messageId);

  console.log(`[BOT] Waiting 10s for human handover...`);
  const shouldReply = await stateManager.waitForHandover(remoteJid);
  if (!shouldReply) return;

  if (!(await sessionStore.claimForAI(remoteJid, messageId))) return;

  await sock.readMessages([msg.key]);
  await sock.sendPresenceUpdate('composing', remoteJid);

  try {
    const aiReply = await aiHandler.generateReply(textMessage);
    if (!(await sessionStore.isStillActive(remoteJid, messageId))) return;
    const sent = await sock.sendMessage(remoteJid, { text: aiReply }, { quoted: msg });
    if (sent?.key.id) botMessageIds.add(sent.key.id);
    console.log(`[BOT] Replied to ${remoteJid}`);
  } finally {
    await sock.sendPresenceUpdate('paused', remoteJid);
  }
}

async function connectToWhatsApp(): Promise<void> {
  await updateWhatsAppConnection({ status: 'starting', qr: null, lastError: null });
  const { state, saveCreds } = await loadAuthState('auth_info_baileys');
  const { version, isLatest } = await fetchLatestWaWebVersion();
  console.log(`[BOT] Using WhatsApp Web version ${version.join('.')} (${isLatest ? 'latest' : 'fallback'})`);
  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: process.env.LOG_LEVEL || 'info' }),
    browser: ['Rendy Assistant', 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('Scan the QR code above to connect.');
      void QRCode.toDataURL(qr, { width: 320, margin: 2 })
        .then((qrDataUrl) => updateWhatsAppConnection({
          status: 'qr',
          qr: qrDataUrl,
          phoneNumber: null,
          lastError: null,
        }))
        .catch((error) => console.error('[BOT] Failed to generate dashboard QR:', error));
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnecting:', shouldReconnect);
      void updateWhatsAppConnection({
        status: shouldReconnect ? 'disconnected' : 'error',
        qr: null,
        lastError: `WhatsApp connection closed (status ${statusCode ?? 'unknown'})`,
      });
      if (shouldReconnect) void connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('WhatsApp connection opened successfully!');
      void updateWhatsAppConnection({
        status: 'connected',
        qr: null,
        phoneNumber: sock.user?.id?.split(':')[0] ?? null,
        lastError: null,
      });
    }
  });

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      void handleMessage(sock, msg).catch((error) => {
        console.error('[BOT] Error handling message:', error);
      });
    }
  });
}

connectToWhatsApp().catch((error) => {
  console.error('Error starting bot:', error);
  void updateWhatsAppConnection({
    status: 'error',
    qr: null,
    lastError: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
