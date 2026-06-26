export class StateManager {
    private activeSessions = new Map<string, NodeJS.Timeout>();
    private HANDOVER_DELAY_MS = 5000; // 5 seconds

    /**
     * Call this when a new message from a remote user arrives
     * @returns A promise that resolves if the AI should reply (10s passed with no human intervention)
     *          and rejects/resolves false if the human replied or it was cancelled.
     */
    public waitForHandover(remoteJid: string): Promise<boolean> {
        return new Promise((resolve) => {
            // If there's an existing timer, clear it and restart
            if (this.activeSessions.has(remoteJid)) {
                clearTimeout(this.activeSessions.get(remoteJid));
            }

            const timeoutId = setTimeout(() => {
                // Timer finished without human intervention
                this.activeSessions.delete(remoteJid);
                resolve(true);
            }, this.HANDOVER_DELAY_MS);

            this.activeSessions.set(remoteJid, timeoutId);
        });
    }

    /**
     * Call this when the admin/human replies to a conversation (fromMe = true)
     */
    public humanTookOver(remoteJid: string) {
        if (this.activeSessions.has(remoteJid)) {
            clearTimeout(this.activeSessions.get(remoteJid));
            this.activeSessions.delete(remoteJid);
            console.log(`[Handover] Admin took over chat with ${remoteJid}. Cancelled AI reply.`);
        }
    }
}
