
/* __JEST_WEBWORKER_SEPARATOR__ */

self.onmessage = (ev) => {
	self.postMessage(ev.data);
};

