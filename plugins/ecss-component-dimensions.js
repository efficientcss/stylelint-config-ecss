import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/component-dimensions';
const messages = ruleMessages(ruleName, {
	expected: 'Do not force dimensions on a component. Only limit them.',
});

const meta = {
	url: 'https://example.com/rules/component-dimensions'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const componentSelectorsRegex = /^(?!& )(?!.*__)([.]|\\[[a-z0-9-_]*="?)(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea))[a-zA-Z0-9-_]+("?\\])?$/;

		postcssRoot.walkRules((rule) => {
			if (componentSelectorsRegex.test(rule.selector)) {
				rule.walkDecls(/^(width|height)$/, (decl) => {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, decl],
						node: decl,
						result: postcssResult,
						ruleName,
					});
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
