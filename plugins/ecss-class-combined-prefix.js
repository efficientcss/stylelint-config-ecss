import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/class-combined-prefix';
const messages = ruleMessages(ruleName, {
	expected: 'Combined classes should always be prefixed.',
});

const meta = {
	url: 'https://example.com/rules/class-combined-prefix'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const unprefixedCombinedClassRegex = /^(&|[.][a-zA-Z-_]*)[.](?!is-|as-|on-|to-|with-|and-|now-|fx-|for-|__).*$/;

		postcssRoot.walkRules((rule) => {
			if (unprefixedCombinedClassRegex.test(rule.selector)) {
				report({
					message: messages.expected,
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
