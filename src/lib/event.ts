type EventListener = (...args: any[]) => void;

class EventEmitter {
	private events: { [event: string]: EventListener[] } = {};

	on(event: string, listener: EventListener): void {
		if (!this.events[event]) this.events[event] = [];
		this.events[event].push(listener);
	}

	emit(event: string, ...args: any[]): void {
		if (this.events[event]) {
			this.events[event].forEach(listener => listener(...args));
		}
	}

	off(event: string, listener: EventListener): void {
		if (!this.events[event]) return;
		this.events[event] = this.events[event].filter(l => l !== listener);
	}
}

export const emitter = new EventEmitter();
