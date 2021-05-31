
import { Worker } from 'worker_threads';

export type ListenerFunction = (ev: { data: unknown }) => void;

export default class ParentWorker extends Worker {
	constructor(filename: string = '@@WORKER_URL@@') {
		super(filename);
		this.on('error', (error) => {
			if(this.onerror) this.onerror(error);
		});
		this.on('message', (data: unknown) => {
			if(this.onmessage) this.onmessage({ data });
		});
		this.on('messageerror', (error) => {
			if(this.onmessageerror) this.onmessageerror(error);
		});
		this.unref();
	}
	onerror: ((error: Error) => void) | null = null;
	onmessage: ListenerFunction | null = null;
	onmessageerror: ((error: Error) => void) | null = null;
	addEventListener(event: string, listener: ListenerFunction) {
		this.addListener(event, (data: unknown) => {
			listener({ data });
		});
	}
}

