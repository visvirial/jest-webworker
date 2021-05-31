
import EchoWorker from './echo.worker.ts';

describe('EchoWorker (TypeScript)', () => {
	it('can execute WebWorker', async () => {
		const worker = new EchoWorker();
		await new Promise<void>((resolve, reject) => {
			worker.onmessage = (ev) => {
				expect(ev.data).toBe('Hello world!');
				resolve();
			};
			worker.postMessage('Hello world!');
		});
	});
});

