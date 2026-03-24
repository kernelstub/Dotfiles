import * as MessageTray from "resource:///org/gnome/shell/ui/messageTray.js";
export class MessageTrayManager {
    settingsManager;
    _updateStateOrig;
    _updateNotificationTimeoutOrig;
    updateStateHooks = [];
    updateNotificationTimeoutHooks = [];
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    registerUpdateStateHook(hook) {
        this.updateStateHooks.push(hook);
    }
    registerUpdateNotificationTimeoutHook(hook) {
        this.updateNotificationTimeoutHooks.push(hook);
    }
    enable() {
        this.patchUpdateState();
        this.patchUpdateNotificationTimeout();
    }
    disable() {
        this.restoreUpdateState();
        this.restoreUpdateNotificationTimeout();
    }
    patchUpdateState() {
        const messageTrayProto = MessageTray.MessageTray
            .prototype;
        this._updateStateOrig = messageTrayProto._updateState;
        const updateStateOrig = this._updateStateOrig;
        const hooks = this.updateStateHooks;
        messageTrayProto._updateState = function () {
            let originalCalled = false;
            for (const hook of hooks) {
                hook(() => {
                    if (!originalCalled) {
                        originalCalled = true;
                        return updateStateOrig.call(this);
                    }
                }, { tray: this });
            }
            if (!originalCalled) {
                return updateStateOrig.call(this);
            }
        };
    }
    restoreUpdateState() {
        const messageTrayProto = MessageTray.MessageTray
            .prototype;
        if (this._updateStateOrig) {
            messageTrayProto._updateState = this._updateStateOrig;
            this._updateStateOrig = undefined;
        }
    }
    patchUpdateNotificationTimeout() {
        const messageTrayProto = MessageTray.MessageTray
            .prototype;
        this._updateNotificationTimeoutOrig =
            messageTrayProto._updateNotificationTimeout;
        const updateTimeoutOrig = this._updateNotificationTimeoutOrig;
        const hooks = this.updateNotificationTimeoutHooks;
        messageTrayProto._updateNotificationTimeout = function (timeout) {
            let finalTimeout = timeout;
            for (const hook of hooks) {
                finalTimeout = hook((timeout) => updateTimeoutOrig.call(this, timeout), finalTimeout, { tray: this });
                if (finalTimeout === null) {
                    break;
                }
            }
            if (finalTimeout !== null) {
                return updateTimeoutOrig.call(this, finalTimeout);
            }
        };
    }
    restoreUpdateNotificationTimeout() {
        const messageTrayProto = MessageTray.MessageTray
            .prototype;
        if (this._updateNotificationTimeoutOrig) {
            messageTrayProto._updateNotificationTimeout =
                this._updateNotificationTimeoutOrig;
            this._updateNotificationTimeoutOrig = undefined;
        }
    }
    dispose() {
        this.disable();
        this.updateStateHooks = [];
        this.updateNotificationTimeoutHooks = [];
    }
}
