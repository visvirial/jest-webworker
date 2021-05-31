jest-webworker: WebPack's "worker-loader"-compliant Jest transformer
====================================================================

[![Node.js CI](https://github.com/visvirial/jest-webworker/actions/workflows/node.js.yml/badge.svg)](https://github.com/visvirial/jest-webworker/actions/workflows/node.js.yml)

⚠WARNING⚠: This package is currently experimental. Please avoid using it in production.

A Jest transformer which can execute WebWorker codes that uses WebPack's
[worker-loader](https://github.com/webpack-contrib/worker-loader).

This is an alternative implementation of [workerloader-jest-transformer](https://github.com/astagi/workerloader-jest-transformer).
This library aims to enable WebWorker codes run in parallel in Jest environments (where *workerloader-jest-transformer* cannot).

Install
-------

```bash
$ npm install -D jest-webworker
```

Usage
-----

1. Add `jest-webworker/@types` to `compilerOptions.typeRoots` in your `tsconfig.json`.
1. Rename your worker source file to `*.worker.ts`.
1. Change your `import` statement in your worker launching code as below:
```ts
import HogeWorker from './hoge.worker.ts';
```
Note: please avoid using `worker-loader!` prefix since it cannot be recognized by Jest.
1. Add the following comment between your `import` statements and source code body:
```ts
/* @@JEST_WEBWORKER_SEPARATOR@@ */
```
1. Run jest and enjoy testing!

Examples
--------

Please take a look at test codes inside the [./\_\_tests\_\_](./__tests__) directory for more detailed usage.

Motivation
----------

The [workerloader-jest-transformer](https://github.com/astagi/workerloader-jest-transformer) package is considerably
a nobel implementation of WebPack's WebWorker transformer, however,
[workerloader-jest-transformer](https://github.com/astagi/workerloader-jest-transformer)
launches Workers in the main Node.js thread and hence cannot be parallelized in practice.
This will reduce the test performance for WebWorker codes which launches multiple WebWorker threads and process data in parallel.

This package, on the other hand, launches Worker threads using Node.js's `worker_threads` feature and
executes WebWorkers in a thread other than the main thread.

The performance improvements can be measured by running the `fibonacci` test
(computes the 40-th fibonacci number using recurrsion = slow implementation, in purpose).

```bash
$ npm t fibo 

> jest-webworker@0.0.1 test
> jest "fibo"

 PASS  __tests__/fibonacci.test.ts (11.077 s)
  FibonacciWorker
    ✓ can execute in parallel (2276 ms)
    ✓ can execute in serial (7882 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        11.131 s
Ran all test suites matching /fibo/i.
```

On my desktop machine with 4 CPU cores can execute the test laughly x3.46 faster than the serialized case (see above).

Contributiion
-------------

Any contribution, including bug reports, comments, suggenstions and / or  pull requests are acceptable 🍻.


