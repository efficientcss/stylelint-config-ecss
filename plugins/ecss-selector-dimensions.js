import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";
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

const preprocessCSS = async (css) => {
	const result = await postcss([nested]).process(css, { from: undefined });
	return result.root;
};

const ruleFunction = (primaryOption, secondaryOption, context) => async (postcssRoot, postcssResult) => {
	const notGraphicalSelectorsRegex = /^(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|figure|hr$|svg|line|logo|frame|button|input|select$|textarea)).*$/;
	const processedRoot = await preprocessCSS(postcssRoot.toString());

	processedRoot.walkRules((rule) => {
		rule.walkDecls(/^(?:max-)?(?:width|height)$/, (decl) => {
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

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
