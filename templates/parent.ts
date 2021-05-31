
import { writeFileSync, unlinkSync, statSync } from 'fs';
import { randomBytes } from 'crypto';
import { Worker } from 'worker_threads';

export type ListenerFunction = (ev: { data: unknown }) => void;

const DIRNAME = '@@WORKER_DIR@@';

export default class ParentWorker {
	private worker: Worker;
	constructor() {
		let filename: string | null = null;
		for(; filename===null;) {
			const RANDOM_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			const FILENAME_LENGTH = 8;
			const rnd = randomBytes(FILENAME_LENGTH);
			let tmp = '__';
			for(let i=0; i<FILENAME_LENGTH; i++) {
				tmp += RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length];
			}
			let tmpname = DIRNAME + '/' + tmp + '.js';
			try {
				statSync(tmpname);
			} catch(err) {
				filename = tmpname;
			}
		}
		writeFileSync(filename, Buffer.from('@@WORKER_COMPILED_CODE@@', 'base64'));
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
	addEventListener(event: string, listener: ListenerFunction) {
		this.worker.addListener(event, (data: unknown) => {
			listener({ data });
		});
	}
	postMessage(data: unknown): void {
		this.worker.postMessage(data);
	}
}

