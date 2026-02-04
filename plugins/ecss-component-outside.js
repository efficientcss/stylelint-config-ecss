import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';
import { component_selectors } from '../lib/selectors.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/component-outside';
const messages = ruleMessages(ruleName, {
	expected: 'A component should not influence its external context. Its parent container takes care of the rhythm.',
});

const meta = {
	url: printUrl('component-outside')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['margin'].includes(node.prop)
			);

			if (component_selectors.test(rule.selector)) {
				selectedNodes.forEach(decl => {
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
