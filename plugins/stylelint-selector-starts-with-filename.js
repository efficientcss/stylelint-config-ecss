const stylelint = require("stylelint");
const report = stylelint.utils.report;
const ruleMessages = stylelint.utils.ruleMessages;
const validateOptions = stylelint.utils.validateOptions;

const path = require("path");

const ruleName = 'plugin/selector-starts-with-filename';
const messages = ruleMessages(ruleName, {
	rejected: (selector, filename) => `All selectors must begin with filename. ${selector} vs. ${filename}`
});

const rule = () => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName);
		const filename = path.parse(root.source.input.file).name;
		const selectorPattern = '^((\\* \\+ |\\* ~ )?(\\.|\\[.*=)?)?(\")?'+filename+'(?:-[a-zA-Z]+)?(\")?(\\])?.*';
		const selectorRegExp = new RegExp(selectorPattern, 'g');

		if (!validOptions) {
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

module.exports = stylelint.createPlugin(ruleName, rule);
module.exports.ruleName = ruleName;
module.exports.messages = messages;
