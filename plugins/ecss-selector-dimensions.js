import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';
import printUrl from '../lib/printUrl.js';


const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/selector-dimensions';
const messages = ruleMessages(ruleName, {
	expected: 'Only graphical elements should be given heights.',
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
	const componentSelectorsRegex = /^(?!& )(?!.*__)([.]|\\[[a-z0-9-_]*="?)(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea))[a-zA-Z0-9-_]+("?\\])?$/;
	const processedRoot = await preprocessCSS(postcssRoot.toString());

	processedRoot.walkRules((rule) => {

		const selectedNodes = rule.nodes.filter((node) => 
			node.type === 'decl' && /^(?:max-)?(?:height)$/.test(node.prop)
		);

		const hasNeededProp = selectedNodes.length && hasPropertyValueInContext(rule, /(text-indent|background|border|margin|box-sizing|overflow)/, /.*/, 'self');

		selectedNodes.forEach(node => {
			if (notGraphicalSelectorsRegex.test(rule.selector) && !componentSelectorsRegex.test(rule.selector) && !hasNeededProp) {
				report({
					message: messages.expected,
					messageArgs: [rule.selector, node],
					node,
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
