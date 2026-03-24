import * as MessageTray from "resource:///org/gnome/shell/ui/messageTray.js";
export class UrgencyAdapter {
    settingsManager;
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    createHook() {
        const settingsManager = this.settingsManager;
        return (_original, notification, _ctx) => {
            if (settingsManager.notificationTimeout === 0) {
                notification.urgency = MessageTray.Urgency.CRITICAL;
            }
            else if (settingsManager.alwaysNormalUrgency) {
                notification.urgency = MessageTray.Urgency.NORMAL;
            }
        };
    }
    register(manager) {
        manager.registerAddNotificationHook(this.createHook());
    }
    dispose() { }
}
