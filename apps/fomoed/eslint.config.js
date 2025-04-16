import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';

export default [
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript/no-unused-vars': false
		}
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parser: parser,
			parserOptions: {
				project: './tsconfig.json'
			}
		}
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended
];
