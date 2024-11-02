import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/pseudo-disallowed';
const messages = ruleMessages(ruleName, {
	expected: 'This pseudo-class should be avoided.',
});

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const disallowedPseudoRegex = /:(first-child|last-child)/;

		postcssRoot.walkRules((rule) => {
			if (disallowedPseudoRegex.test(rule.selector)) {
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

export default createPlugin(ruleName, ruleFunction);
