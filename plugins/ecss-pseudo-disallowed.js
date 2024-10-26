import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/pseudo-disallowed';
const messages = ruleMessages(ruleName, {
	expected: 'This pseudo-class should be avoided.',
});

const meta = {
	url: 'https://example.com/rules/pseudo-disallowed'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const disallowedPseudoRegex = /:(first-child|last-child)/;

		postcssRoot.walkRules((rule) => {
			// Check if the selector contains a disallowed pseudo-class
			if (disallowedPseudoRegex.test(rule.selector)) {
				report({
					message: messages.expected,
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
