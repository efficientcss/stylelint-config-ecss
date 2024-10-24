import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/align-display';
const messages = ruleMessages(ruleName, {
	expected: 'Expected "display: flex" or "display: grid" when using alignment or justification properties.',
});

const meta = {
	url: 'https://example.com/rules/align-display'
};

const ruleFunction = () => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['align-items', 'justify-content', 'gap'].includes(node.prop)
			);

			const hasFlexOrGridDisplay = hasPropertyValueInContext(rule, 'display', /flex|grid/, 'self');

			selectedNodes.forEach(node => {
				if (!hasFlexOrGridDisplay) {
					report({
						message: messages.expected,
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
