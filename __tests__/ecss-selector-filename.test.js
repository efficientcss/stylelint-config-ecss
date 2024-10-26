import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const fixturesPath = fileURLToPath(new URL('./fixtures', import.meta.url));
const ruleName = 'ecss-selector-filename';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/ecss-selector-filename.js')
	],
	rules: {
		[ruleName]: true
	}
};

describe(ruleName, () => {
	test('should flag selectors not starting with filename', async () => {
		const result = await stylelint.lint({
			files: `${fixturesPath}/filename.fail.css`,
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(14);
		expect(warnings[0].text).toContain('filename');
	});

	test('should pass selectors starting with filename', async () => {
		const result = await stylelint.lint({
			files: `${fixturesPath}/filename.pass.css`,
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
