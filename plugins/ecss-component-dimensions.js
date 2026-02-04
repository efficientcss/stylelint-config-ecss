import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';
import { component_selectors } from '../lib/selectors.js';

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
		postcssRoot.walkRules((rule) => {

			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && /^(!?:max-)?(?:width|height)$/.test(node.prop)
			);

			selectedNodes.forEach(node => {
				if (component_selectors.test(rule.selector)) {
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
