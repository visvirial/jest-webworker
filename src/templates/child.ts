
import { EventEmitter } from 'events';
import { unlinkSync } from 'fs';
import { TransferListItem, parentPort } from 'worker_threads';

/* __WORKER_HEADERS__ */

unlinkSync(__filename);

export type ListenerFunction = (ev: { data: unknown }) => void;
export type ListenerFunctionNode = (data: unknown) => void;

if(parentPort === null) throw new Error('"worker_threads/parentPort" is not available.');

export class ListenerData {
	public listenerNode: ListenerFunctionNode;
	constructor(public listener: ListenerFunction) {
		this.listenerNode = (data) => {
			listener({ data });
		};
	}
}

export default class ChildWorker {
	private listeners: ListenerData[] = [];
	onmessage: ListenerFunction | null = null;
	addEventListener(event: string, listener: ListenerFunction): EventEmitter {
		const l = new ListenerData(listener);
		this.listeners.push(l);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return parentPort!.addListener(event, l.listenerNode);
	}
	removeEventListener(event: string | symbol, listener: ListenerFunction): EventEmitter | null {
		for(let i=0; i<this.listeners.length; i++) {
			if(this.listeners[i].listener == listener) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const ret = parentPort!.removeListener(event, this.listeners[i].listenerNode);
				this.listeners.splice(i, 1);
				return ret;
			}
		}
		return null;
	}
	postMessage(data: unknown, transfer?: TransferListItem[]): void {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		parentPort!.postMessage(data, transfer);
	}
	run(): void {
		// eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
		const self = this;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const postMessage = this.postMessage;
		// eslint-disable-next-line prefer-const
		let onmessage: ListenerFunction | null = null;
		
/* __WORKER_CODE__ */
		
		this.addEventListener('message', (ev) => {
			if(onmessage) {
				onmessage(ev);
			}
			if(this.onmessage) {
				this.onmessage(ev);
			}
		});
	}
}

const worker = new ChildWorker();
worker.run();

