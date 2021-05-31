
import { cpus } from 'os';

import FibonacciWorker from './fibonacci.worker.ts';

const execFibo = (): Promise<void> => {
	const worker = new FibonacciWorker();
	return new Promise<void>((resolve, reject) => {
		worker.onmessage = (ev) => {
			expect(ev.data).toBe(55);
			resolve();
		};
		worker.postMessage(10);
	});
};

describe('FibonacciWorker', () => {
	const nThreads = cpus().length;
	it('can execute in parallel', async () => {
		let promises: Promise<void>[] = [];
		for(let t=0; t<nThreads; t++) {
			promises.push(execFibo());
		}
		await Promise.all(promises);
	});
	it('can execute in serial', async () => {
		for(let t=0; t<nThreads; t++) {
			await execFibo();
		}
	});
});

