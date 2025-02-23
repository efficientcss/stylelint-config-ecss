import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/width-100p';
const messages = ruleMessages(ruleName, {
	expected: '`width: 100%` is generally unnecessary. The default value `auto` shoudl be kept.',
});

const meta = {
	url: ''
};

const preprocessCSS = async (css) => {
	const result = await postcss([nested]).process(css, { from: undefined });
	return result.root;
};;


const ruleFunction = (primaryOption, secondaryOption, context) => async (postcssRoot, postcssResult) => {
	const processedRoot = await preprocessCSS(postcssRoot.toString());
	const notGraphicalSelectorsRegex = /^(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|figure|hr$|svg|line|logo|frame|button|input|select$|textarea)).*$/;
	processedRoot.walkRules((rule) => {
		rule.walkDecls('width', (decl) => {
			if (/^100%$/.test(decl.value) && notGraphicalSelectorsRegex.test(rule.selector)) {
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
