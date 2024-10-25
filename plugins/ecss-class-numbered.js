import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/class-numbered';
const messages = ruleMessages(ruleName, {
	expected: 'Avoid numbers in class names.',
});

const meta = {
	url: 'https://example.com/rules/class-numbered'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const numberedClassRegex = /\.(?!(h[1-6]|grid-[0-9]+|col-[0-9]+)$)[a-zA-Z-]*[0-9]+/;

		postcssRoot.walkRules((rule) => {
			if (numberedClassRegex.test(rule.selector)) {
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
