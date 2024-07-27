import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'magic-numbers/magic-numbers';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/stylelint-magic-numbers.js')
	],
	rules: {
		[ruleName]: [true, {
			acceptedValues: ["700"]
		}]
	}
};

describe(ruleName, () => {
	test('should flag magic numbers', async () => {
		const result = await stylelint.lint({
			code: 'a { width: 100px; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain('100px');
	});

	test('should pass predefined numbers', async () => {
		const result = await stylelint.lint({
			code: 'a { font-weight: 700; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
