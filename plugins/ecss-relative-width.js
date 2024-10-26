import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/relative-width';
const messages = ruleMessages(ruleName, {
	expected: 'Prefer "flex-basis" for percentage widths.',
});

const meta = {
	url: 'https://example.com/rules/relative-width'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			rule.walkDecls('width', (decl) => {
				if (/^(?!100%)\d+%$/.test(decl.value)) {
					report({
						message: messages.expected,
						node: decl,
						result: postcssResult,
						ruleName,
					});
				}
			});
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
