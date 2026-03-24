import { Source, } from "resource:///org/gnome/shell/ui/messageTray.js";
export class SourceManager {
    settingsManager;
    _addNotificationOrig;
    addNotificationHooks = [];
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    registerAddNotificationHook(hook) {
        this.addNotificationHooks.push(hook);
    }
    enable() {
        this.patchAddNotification();
    }
    disable() {
        this.restoreAddNotification();
    }
    patchAddNotification() {
        this._addNotificationOrig = Source.prototype.addNotification;
        const addNotificationOrig = this._addNotificationOrig;
        const hooks = this.addNotificationHooks;
        Source.prototype.addNotification = function (notification) {
            let handled = false;
            let blocked = false;
            for (const hook of hooks) {
                hook((notificationToProcess) => {
                    handled = true;
                    addNotificationOrig.call(this, notificationToProcess);
                }, notification, {
                    source: this,
                    block: () => {
                        blocked = true;
                    },
                });
                if (blocked) {
                    return;
                }
            }
            if (!handled && !blocked) {
                addNotificationOrig.call(this, notification);
            }
        };
    }
    restoreAddNotification() {
        if (this._addNotificationOrig) {
            Source.prototype.addNotification = this._addNotificationOrig;
            this._addNotificationOrig = undefined;
        }
    }
    dispose() {
        this.disable();
        this.addNotificationHooks = [];
    }
}
