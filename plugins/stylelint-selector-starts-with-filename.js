import stylelint from "stylelint";
import path from "path";

function isString(value) {
	return typeof value === 'string' || value instanceof String;
}

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions }
} = stylelint;


const ruleName = 'plugin/selector-starts-with-filename';
const messages = ruleMessages(ruleName, {
	rejected: (selector, filename) => `All selectors must begin with filename. ${selector} vs. ${filename}`
});

const rule = (primary, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, 
			ruleName,
			{ actual: primary },
			{
				actual: secondaryOptions,
				possible: {
					ignoreFiles: [isString],
				},
				optional: true,
			},
		);
		const inputFile = root.source.input.file;
		const filename = path.parse(inputFile).name.split('.')[0];
		const selectorPattern = '^:?(is\\(|where\\()?((\\* \\+ |\\* ~ )?(\\.|\\[.*=)?)?(\")?'+filename+'(?:-[a-zA-Z]+)?(\")?(\\])?.*';
		const selectorRegExp = new RegExp(selectorPattern);

		if (!validOptions) {
			return;
		}

		// skip filenames starting with digit or "x-" pattern
		if (filename.match(/^\d/) || filename.startsWith("x-")) {
			return;
		}

		root.walkRules((rule) => {
			rule.selectors.forEach((selector) => {
				if(!selectorRegExp.test(selector)) {
					report({
						messageArgs: [selector, filename],
						message: messages.rejected(selector, filename),
						node: rule,
						result,
						ruleName,
					});
				}
			});
		});
	}
}

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);
