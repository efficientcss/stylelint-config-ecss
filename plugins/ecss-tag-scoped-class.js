import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/tag-scoped-class';
const messages = ruleMessages(ruleName, {
	expected: "Don't scope class/attribute selectors to some tags only.",
});

const meta = {
	url: 'https://example.com/rules/tag-scoped-class'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const tagScopedClassRegex = /^(?![.])(div|header|footer|section|aside|article)( |>| > )+([.]|\\[[a-z-_]*=?"?).*("?\\])?$/;

		postcssRoot.walkRules((rule) => {
			// Check if the selector contains a class or attribute scoped by a tag
			if (tagScopedClassRegex.test(rule.selector)) {
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
