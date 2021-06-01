
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
	constructor() {
	}
	addEventListener(event: string, listener: ListenerFunction) {
		const l = new ListenerData(listener);
		this.listeners.push(l);
		return parentPort!.addListener(event, l.listenerNode);
	}
	removeEventListener(event: string | symbol, listener: ListenerFunction) {
		for(let i=0; i<this.listeners.length; i++) {
			if(this.listeners[i].listener == listener) {
				const ret = parentPort!.removeListener(event, this.listeners[i].listenerNode);
				this.listeners.splice(i, 1);
				return ret;
			}
		}
	}
	postMessage(data: unknown, transfer?: TransferListItem[]) {
		return parentPort!.postMessage(data, transfer);
	}
	run() {
		const self = this;
		const postMessage = this.postMessage;
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

