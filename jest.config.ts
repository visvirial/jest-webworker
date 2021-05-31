
export default {
	verbose: true,
	coverageDirectory: 'coverage',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	transform: {
		'^.+\\.worker\\.[t|j]sx?$': './dist/index.js',
		'^.+\\.[t|j]sx?$': 'ts-jest',
	},
};

