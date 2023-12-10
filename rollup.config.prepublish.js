// https://stackoverflow.com/a/57718411

import babel from '@rollup/plugin-babel';

/**
 * @type {import('rollup').RollupOptions}
 */
let config = {
	input: 'src/index.js',
	output: [
		{
			file: 'lib/browser.js',
			format: 'es',
			sourcemap: true,
		},
		{
			file: 'lib/main.cjs',
			format: 'cjs',
			sourcemap: true,
		},
	],
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
		}),
	],
};

export default config;
