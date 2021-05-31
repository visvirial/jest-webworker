
import { cpus } from 'os';

import OsCpuWorker from './os.cpu.worker.ts';

describe('OsCpuWorker', () => {
	it('can execute OsCpuWorker', async () => {
		const worker = new OsCpuWorker();
		await new Promise<void>((resolve, reject) => {
			worker.onmessage = (ev) => {
				expect(ev.data).toBe(cpus().length);
				resolve();
			};
		});
	});
});

