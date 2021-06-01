
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';

import { Config } from '@jest/types';
import { SyncTransformer, TransformOptions, TransformedSource } from '@jest/transform';
import tsJest from 'ts-jest';
import { TsJestTransformer } from 'ts-jest/dist/ts-jest-transformer';

import { generateRandomFile } from './templates/parent';

const WORKER_CODE_PATTERN = '/* __WORKER_CODE__ */';
const WORKER_COMPILED_CODE_PATTERN = '__WORKER_COMPILED_CODE__';
const WORKER_DIR_PATTERN = '__WORKER_DIR__';
const WORKER_HEADER_PATTERN = '/* __WORKER_HEADERS__ */';
const WORKER_SEPARATOR_PATTERN = '/* __JEST_WEBWORKER_SEPARATOR__ */';

const PARENT_PATH = resolve(__dirname, '..', 'src', 'templates', 'parent.ts');
const PARENT_SRC = readFileSync(PARENT_PATH).toString('utf8');
const CHILD_PATH = resolve(__dirname, '..', 'src', 'templates', 'child.ts');
const CHILD_SRC = readFileSync(CHILD_PATH).toString('utf8');

const splitSource = (src: string): { header: string, body: string } => {
	const split = src.split(WORKER_SEPARATOR_PATTERN);
	if(split.length <= 1) {
		console.warn([
			`\x1b[33mjest-webworker: warn: No "${WORKER_SEPARATOR_PATTERN}" detected.`,
			'If you encounter "error TS1232: An import declaration can only be used in a namespace or module." warnings,',
			`please add "${WORKER_SEPARATOR_PATTERN}" between your imports headers and program body to indicate`,
			'the place where your import statements reside.\x1b[39m',
		].join('\n'));
		return { header: '', body: src };
	}
	if(split.length > 2) {
		console.error([
			`\x1b[31mjest-webworker: error: multiple "${WORKER_SEPARATOR_PATTERN}" detectend.`,
			`Please add only the single "${WORKER_SEPARATOR_PATTERN}" in your source.\x1b[39m`,
		]);
		const header = split.shift() as string;
		return { header: header, body: split.join('\n') };
	}
	return { header: split[0], body: split[1] };
};

export class WebWorkerTransformer implements SyncTransformer {
	constructor(private readonly transformer: TsJestTransformer = tsJest.createTransformer()) {
	}
	private compile(sourceText: string, dir: string, options: TransformOptions): string {
		const filename = generateRandomFile(dir, 'ts');
		writeFileSync(filename, sourceText);
		try {
			const compiled = this.transformer.process(sourceText, filename, options);
			return (typeof compiled === 'string' ? compiled : compiled.code);
		} catch(e) {
			throw e;
		} finally {
			unlinkSync(filename);
		}
	}
	process(sourceText: string, sourcePath: Config.Path, options: TransformOptions): TransformedSource {
		const dir = dirname(sourcePath);
		const { header: sourceHeader, body: sourceBody } = splitSource(sourceText);
		const childSrcTS = CHILD_SRC
			.replace(WORKER_HEADER_PATTERN, sourceHeader)
			.replace(WORKER_CODE_PATTERN, sourceBody);
		const childSrc = this.compile(childSrcTS, dir, options);
		//console.log('childSrc:', childSrc);
		const parentSrcTS = PARENT_SRC
			.replace(WORKER_DIR_PATTERN, dirname(sourcePath))
			.replace(WORKER_COMPILED_CODE_PATTERN, Buffer.from(childSrc).toString('base64'));
		const parentSrc = this.compile(parentSrcTS, dir, options);
		//console.log('parentSrc:', parentSrc);
		return parentSrc;
	}
}

export default {
	createTransformer: () => new WebWorkerTransformer(),
	process: () => null,
};

