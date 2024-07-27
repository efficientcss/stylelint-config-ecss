import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'plugin/no-commented-code';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/stylelint-no-commented-code.js')
	],
	rules: {
		[ruleName]: true
	}
};

describe(ruleName, () => {
	test('should flag commented code', async () => {
		const result = await stylelint.lint({
			code: '/* a { color: red; } */',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain('code');
	});

	test('should pass comments', async () => {
		const result = await stylelint.lint({
			code: '/* This is a comment */',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
