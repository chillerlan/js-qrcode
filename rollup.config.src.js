export default {
	input: 'src/index.js',
	output: [
		{
			file: 'dist/js-qrcode-es6-src.js',
			format: 'es',
			sourcemap: true,
		},
		{
			file: 'dist/js-qrcode-iife-src.js',
			format: 'iife',
			sourcemap: true,
			name: 'jsqrcode',
		},
		{
			file: 'dist/js-qrcode-node-src.cjs',
			format: 'cjs',
			sourcemap: true,
		},
	],
	plugins: [],
};
