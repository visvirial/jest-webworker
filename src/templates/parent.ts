
import { EventEmitter } from 'events';
import { writeFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { randomBytes } from 'crypto';
import { Worker, TransferListItem } from 'worker_threads';

export type ListenerFunction = (ev: { data: unknown }) => void;

export const generateRandomFile = (dir: string, ext: string, filenameLen = 8): string => {
	const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	for(;;) {
		const rnd = randomBytes(filenameLen);
		let tmp = '__';
		for(let i=0; i<filenameLen; i++) {
			tmp += RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length];
		}
		const tmpname = resolve(dir, tmp + '.' + ext);
		try {
			statSync(tmpname);
		} catch(err) {
			return tmpname;
		}
	}
};

export default class ParentWorker {
	private worker: Worker;
	constructor() {
		const DIRNAME = '__WORKER_DIR__';
		const filename = generateRandomFile(DIRNAME, 'js');
		writeFileSync(filename, Buffer.from('__WORKER_COMPILED_CODE__', 'base64'));
		this.worker = new Worker(filename);
		this.worker.on('error', (error) => {
			if(this.onerror) this.onerror(error);
		});
		this.worker.on('message', (data: unknown) => {
			if(this.onmessage) this.onmessage({ data });
		});
		this.worker.on('messageerror', (error) => {
			if(this.onmessageerror) this.onmessageerror(error);
		});
		this.worker.unref();
	}
	onerror: ((error: Error) => void) | null = null;
	onmessage: ListenerFunction | null = null;
	onmessageerror: ((error: Error) => void) | null = null;
	addEventListener(event: string, listener: ListenerFunction): EventEmitter {
		return this.worker.addListener(event, (data: unknown) => {
			listener({ data });
		});
	}
	postMessage(data: unknown, transfer?: TransferListItem[]): void {
		this.worker.postMessage(data, transfer);
	}
}

