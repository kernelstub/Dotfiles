export class ProcessingAdapter {
    settingsManager;
    timings = {};
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    createHook() {
        const settingsManager = this.settingsManager;
        const timings = this.timings;
        return (_original, notification, { block }) => {
            const sourceTitle = notification.source?.title ?? "UNK_SRC";
            if (settingsManager.rateLimitingEnabled) {
                const threshold = settingsManager.notificationThreshold;
                const lastNotification = timings[sourceTitle];
                if (lastNotification && Date.now() - lastNotification < threshold) {
                    notification.acknowledged = true;
                }
                timings[sourceTitle] = Date.now();
            }
            if (settingsManager.filteringEnabled) {
                const filterAction = settingsManager.getFilterFor(notification, sourceTitle);
                if (filterAction === "close") {
                    block();
                    return;
                }
                if (filterAction === "hide") {
                    notification.acknowledged = true;
                }
            }
        };
    }
    register(manager) {
        manager.registerAddNotificationHook(this.createHook());
    }
    dispose() {
        this.timings = {};
    }
}
