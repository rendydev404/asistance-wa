export class StateManager {
    private activeSessions = new Map<string, { timeout: NodeJS.Timeout; resolve: (value: boolean) => void }>();
    private HANDOVER_DELAY_MS = 10000;

    /**
     * Call this when a new message from a remote user arrives
     * @returns A promise that resolves if the AI should reply (10s passed with no human intervention)
     *          and rejects/resolves false if the human replied or it was cancelled.
     */
    public waitForHandover(remoteJid: string): Promise<boolean> {
        return new Promise((resolve) => {
            const existing = this.activeSessions.get(remoteJid);
            if (existing) {
                clearTimeout(existing.timeout);
                existing.resolve(false);
            }

            const timeoutId = setTimeout(() => {
                this.activeSessions.delete(remoteJid);
                resolve(true);
            }, this.HANDOVER_DELAY_MS);

            this.activeSessions.set(remoteJid, { timeout: timeoutId, resolve });
        });
    }

    /**
     * Call this when the admin/human replies to a conversation (fromMe = true)
     */
    public humanTookOver(remoteJid: string) {
        const session = this.activeSessions.get(remoteJid);
        if (session) {
            clearTimeout(session.timeout);
            this.activeSessions.delete(remoteJid);
            session.resolve(false);
            console.log(`[Handover] Admin took over chat with ${remoteJid}. Cancelled AI reply.`);
        }
    }
}
