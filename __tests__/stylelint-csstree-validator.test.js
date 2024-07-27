import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'csstree/validator';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/stylelint-csstree-validator.js')
	],
	rules: {
		[ruleName]: true
	}
};

describe(ruleName, () => {
	test('should flag invalid CSS syntax', async () => {
		const result = await stylelint.lint({
			code: 'a { color: ; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain('Invalid value');
	});

	test('should pass valid CSS syntax', async () => {
		const result = await stylelint.lint({
			code: 'a { color: red; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
