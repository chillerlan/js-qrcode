import {babel} from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
	input: 'src/index.js',
	output: [
		{
			file: 'dist/js-qrcode-es6.js',
			format: 'es',
			sourcemap: false,
		},
		{
			file: 'dist/js-qrcode-node.cjs',
			format: 'cjs',
			sourcemap: false,
		},
	],
	plugins: [
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
		}),
		terser({
			format: {
				comments: false,
				keep_quoted_props: true,
//				max_line_len: 130,
				quote_style: 3,
				preamble: '/*\n'
					+ ' * js-qrcode - a javascript port of chillerlan/php-qrcode\n'
					+ ' *\n'
					+ ' * @copyright  2022 smiley\n'
					+ ' * @license    MIT\n'
					+ ' * @link       https://github.com/chillerlan/js-qrcode\n'
					+ ' */',
			},
		}),
	],
};
