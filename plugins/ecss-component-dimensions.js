import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/component-dimensions';
const messages = ruleMessages(ruleName, {
	expected: 'Do not force dimensions on a component. Only limit them.',
});

const meta = {
	url: printUrl('component-dimensions')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const componentSelectorsRegex = /^(?!& )(?!.*__)([.]|\\[[a-z0-9-_]*="?)(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea))[a-zA-Z0-9-_]+("?\\])?$/;

		postcssRoot.walkRules((rule) => {

			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && /^(?:max-)?(?:width|height)$/.test(node.prop)
			);

			selectedNodes.forEach(node => {
				if (componentSelectorsRegex.test(rule.selector)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, node.decl],
						node,
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
