import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/content-float';
const messages = ruleMessages(ruleName, {
	expected: 'Floating should be reserved for images.',
});

const meta = {
	url: 'https://example.com/rules/content-float'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const textTagRegex = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;
		const notGraphicalSelectorsRegex = /^(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea)).*$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls('float', (decl) => {
				if (textTagRegex.test(rule.selector) && notGraphicalSelectorsRegex.test(rule.selector)) {
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
