import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import * as qrcode from 'qrcode-terminal';
import { StateManager } from './state-manager';
import { AIHandler } from './ai-handler';

// Initialize dependencies
const stateManager = new StateManager();
const aiHandler = new AIHandler();

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Setup logger using pino
    const logger = pino({ level: 'info' });

    const sock = makeWASocket({
        auth: state,
        logger: logger,
        browser: ["Rendy Assistant", "Chrome", "1.0.0"],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log('Scan the QR code above to connect.');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp connection opened successfully!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        // console.log('Got messages:', JSON.stringify(m, undefined, 2));

        if (m.type === 'notify') {
            for (const msg of m.messages) {
                // Ignore empty messages
                if (!msg.message) continue;

                const remoteJid = msg.key.remoteJid;
                if (!remoteJid) continue;

                // Extract text from the message (can be conversation or extendedTextMessage)
                const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

                if (msg.key.fromMe) {
                    // Admin (User) took over!
                    stateManager.humanTookOver(remoteJid);
                    console.log(`[BOT] User replied to ${remoteJid}, AI handover cancelled.`);
                    continue;
                }

                // If it's a message from someone else and it has text
                if (textMessage) {
                    console.log(`[BOT] Received message from ${remoteJid}: ${textMessage}`);
                    
                    try {
                        // Wait for 5 seconds (or if already waiting, resets the timer for logic)
                        console.log(`[BOT] Waiting 5s for human handover...`);
                        const shouldReply = await stateManager.waitForHandover(remoteJid);

                        if (shouldReply) {
                            console.log(`[BOT] 5s passed. AI is taking over for ${remoteJid}`);
                            // Mark as read (optional)
                            await sock.readMessages([msg.key]);
                            
                            // Send composing state
                            await sock.sendPresenceUpdate('composing', remoteJid);

                            // Generate AI Reply
                            const aiReply = await aiHandler.generateReply(textMessage);

                            // Send Reply
                            await sock.sendMessage(remoteJid, { text: aiReply }, { quoted: msg });
                            console.log(`[BOT] Replied to ${remoteJid}: ${aiReply}`);
                            
                            await sock.sendPresenceUpdate('paused', remoteJid);
                        }
                    } catch (error) {
                        console.error("[BOT] Error handling message:", error);
                    }
                }
            }
        }
    });
}

// run in main file
connectToWhatsApp().catch(err => console.error("Error starting bot:", err));
