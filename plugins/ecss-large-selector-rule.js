import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/large-selector-rule';
const messages = ruleMessages(ruleName, {
	expected: 'Avoid changing important properties on wide selectors.',
});

const meta = {
	url: 'https://example.com/rules/large-selector-rule'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const structureTagRegex = /^(div|header|footer|section|aside|article)$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls(/^(position|background|display|padding|margin|width|height|border|shadow)$/, (decl) => {
				if (structureTagRegex.test(rule.selector)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, decl],
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
