export class IdleAdapter {
    settingsManager;
    listenerId;
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    createHook() {
        const settingsManager = this.settingsManager;
        return (original, { tray }) => {
            if (settingsManager.ignoreIdle) {
                tray._userActiveWhileNotificationShown = true;
            }
            original();
        };
    }
    register(manager) {
        this.listenerId = this.settingsManager.events.on("ignoreIdleChanged", () => { });
        manager.registerUpdateStateHook(this.createHook());
    }
    dispose() {
        if (this.listenerId !== undefined) {
            this.settingsManager.events.off(this.listenerId);
            this.listenerId = undefined;
        }
    }
}
