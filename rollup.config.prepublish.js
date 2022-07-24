// https://stackoverflow.com/a/57718411

import {babel} from '@rollup/plugin-babel';

export default {
	input: 'src/index.js',
	output: [
		{
			file: 'lib/browser.js',
			format: "es",
			sourcemap: true,
		},
		{
			file: 'lib/index.js',
			format: "cjs",
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
