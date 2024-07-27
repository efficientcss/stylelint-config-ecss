import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ruleName = 'plugin/declaration-block-conjoined-properties';
const config = {
	plugins: [
		path.resolve(__dirname, '../plugins/stylelint-declaration-block-conjoined-properties.js')
	],
	rules: {
		[ruleName]: [{"/padding-/": {
			"value": "/.*/",
			"ignoreSelectors": [/(>|\s)?(a|ul|ol|button|input)(:.*)?$/, /link$/],
			"neededDeclaration": [{
				"property": /padding$/,
				"value": ".*"
			}]
		}
		}]
	}
};

describe(ruleName, () => {
	test('should flag missing properties', async () => {
		const result = await stylelint.lint({
			code: 'div { padding-left: 10px; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings[0].text).toContain('padding');
	});

	test('should pass conjoined properties', async () => {
		const result = await stylelint.lint({
			code: 'div { padding: 10px; padding-left: 20px; }',
			config
		});

		const warnings = result.results[0].warnings;
		expect(warnings).toHaveLength(0);
	});
});
