import babelParser from "@babel/eslint-parser";

export default [
	{
		files: ['**/*.js'],
		ignores: [
			'**/dist/**',
			'**/lib/**',
			'**/node_modules/**',
		],
		languageOptions: {
			parser: babelParser,
			parserOptions: {
				sourceType: 'module',
				requireConfigFile: false,
				babelOptions: {
					configFile: './babel.config.json',
				},

			},
			ecmaVersion: 2022
		},
		rules: {
			'no-console': 'off',
			'no-debugger': 'off',
			'no-unused-vars': 'off',
			'eqeqeq': 'error',
			'no-useless-escape': 'off',
			'quotes': [
				'error',
				'single',
				{
					'avoidEscape': false
				}
			],
			'max-len': [
				2,
				{
					'code': 130,
					'tabWidth': 4,
					'ignoreUrls': true,
					'ignoreComments': true
				}
			],
			'curly': [
				'error',
				'all'
			]

		}
	}
];
