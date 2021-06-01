
/* __JEST_WEBWORKER_SEPARATOR__ */

const fibo = (n: number): number => {
	if(n === 0) return 0;
	if(n === 1) return 1;
	return fibo(n - 2) + fibo(n - 1);
};

const ctx: Worker = self as any;

ctx.onmessage = (ev) => {
	const n = ev.data as number;
	ctx.postMessage(fibo(n));
};

