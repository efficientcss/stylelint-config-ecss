import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/flex-children';
const messages = ruleMessages(ruleName, {
	expected: (selector, prop) => `${selector} ${prop}, Expected "display: flex" on parent when using flex properties like flex-grow, flex-shrink, or flex-wrap in a child selector block.`
});

const meta = {
	url: printUrl('flex-children')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {

			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['flex-grow', 'flex-basis', 'flex-shrink'].includes(node.prop)
			);

			const parentHasFlexDisplay = selectedNodes.length && hasPropertyValueInContext(rule, 'display', /flex/, 'parent');

			selectedNodes.forEach(node => {
				if (!parentHasFlexDisplay) {

					report({
						message: messages.expected,
						messageArgs: [rule.selector, node.prop],
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
