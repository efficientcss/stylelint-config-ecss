import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/content-padding';
const messages = ruleMessages(ruleName, {
	expected: "The paddings don't go on contents but on containers.",
});

const meta = {
	url: printUrl('content-padding')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const textTagRegex = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls(/padding/, (decl) => {
				if (textTagRegex.test(rule.selector)) {
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
