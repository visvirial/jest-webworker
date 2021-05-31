
/* @@JEST_WEBWORKER_SEPARATOR@@ */

self.onmessage = (ev) => {
	self.postMessage(ev.data);
};

