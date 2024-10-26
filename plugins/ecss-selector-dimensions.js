import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/selector-dimensions';
const messages = ruleMessages(ruleName, {
	expected: 'Only graphical elements should be given dimensions.',
});

const meta = {
	url: 'https://example.com/rules/selector-dimensions'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const notGraphicalSelectorsRegex = /^(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea)).*$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls(/^(width|height)$/, (decl) => {
				if (notGraphicalSelectorsRegex.test(rule.selector)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, decl.prop],
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
