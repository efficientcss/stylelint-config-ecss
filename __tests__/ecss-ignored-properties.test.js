import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'ecss/ignored-properties';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/ecss-ignored-properties.js')
	],
	rules: {
		[ruleName]: true
	}
};

describe(ruleName, () => {
	test('should flag ignored properties', async () => {
		const result = await stylelint.lint({
			code: 'a { display: inline; width: 100px; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(1);
		expect(warnings[0].text).toContain('width');
	});

	test('should pass valid properties', async () => {
		const result = await stylelint.lint({
			code: 'a { display: block; width: 100px; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
