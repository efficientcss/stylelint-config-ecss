import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/class-child-prefix';
const messages = ruleMessages(ruleName, {
	rejected: "Descendant classes should always be prefixed.",
});

const meta = {
	url: 'https://example.com/rules/class-child-prefix'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const unprefixedDescendantRegex = /^.*[\s?>?\s?|\s][.](?!is-|as-|on-|to-|with-|and-|now-|fx-|for-|__).*$/;

		postcssRoot.walkRules((rule) => {
			// Check if the selector matches the regex for unprefixed descendant classes
			if (unprefixedDescendantRegex.test(rule.selector)) {
				report({
					message: messages.rejected,
					messageArgs: [rule.selector],
					node: rule,
					result: postcssResult,
					ruleName,
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
