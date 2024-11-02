import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';


const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/selector-dimensions';
const messages = ruleMessages(ruleName, {
	expected: 'Only graphical elements should be given dimensions.',
});

const meta = {
	url: printUrl('selector-dimensions')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const notGraphicalSelectorsRegex = /^(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea)).*$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls(/^(width|height)$/, (decl) => {
				if (notGraphicalSelectorsRegex.test(rule.selector)) {
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
