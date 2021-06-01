
import { cpus } from 'os';

/* __JEST_WEBWORKER_SEPARATOR__ */

self.postMessage(cpus().length);

