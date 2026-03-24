export class TimeoutAdapter {
    settingsManager;
    listenerId;
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    createHook() {
        const settingsManager = this.settingsManager;
        return (_original, timeout) => {
            if (timeout !== null && timeout > 0) {
                return settingsManager.notificationTimeout > 0
                    ? settingsManager.notificationTimeout
                    : null;
            }
            return timeout;
        };
    }
    register(manager) {
        this.listenerId = this.settingsManager.events.on("notificationTimeoutChanged", () => { });
        manager.registerUpdateNotificationTimeoutHook(this.createHook());
    }
    dispose() {
        if (this.listenerId !== undefined) {
            this.settingsManager.events.off(this.listenerId);
            this.listenerId = undefined;
        }
    }
}
