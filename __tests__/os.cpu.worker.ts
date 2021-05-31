
import { cpus } from 'os';

/* @@JEST_WEBWORKER_SEPARATOR@@ */

self.postMessage(cpus().length);

