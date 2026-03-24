export class TypedEventEmitter {
    listeners = new Map();
    nextId = 1;
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Map());
        }
        const id = this.nextId++;
        // biome-ignore lint/style/noNonNullAssertion: Checked above
        this.listeners
            .get(event)
            .set(id, listener);
        return id;
    }
    off(id) {
        for (const eventListeners of this.listeners.values()) {
            if (eventListeners.has(id)) {
                eventListeners.delete(id);
                return;
            }
        }
    }
    emit(event, ...args) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            for (const listener of eventListeners.values()) {
                listener(...args);
            }
        }
    }
}
