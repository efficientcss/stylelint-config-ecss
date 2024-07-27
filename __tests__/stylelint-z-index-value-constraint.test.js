import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'plugin/z-index-value-constraint';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/stylelint-z-index-value-constraint.js')
	],
	rules: {
		[ruleName]: [{
			"min": 0,
			"max": 10
		}, {
			"ignoreValues": [-1]
		}]
	}
};

describe(ruleName, () => {
	test('should flag invalid z-index values', async () => {
		const result = await stylelint.lint({
			code: 'a { z-index: 9999; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain('z-index');
	});

	test('should pass valid z-index values', async () => {
		const result = await stylelint.lint({
			code: 'a { z-index: 10; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});

	test('should pass ignored values', async () => {
		const result = await stylelint.lint({
			code: 'a { z-index: -1; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
