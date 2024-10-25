import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/flex-prop';
const messages = ruleMessages(ruleName, {
	expected: 'Expected "display: flex" when using flex properties like flex-direction, flex-wrap, or flex-flow in a self-combined context without child selectors.',
});

const meta = {
	url: 'https://example.com/rules/flex-prop'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['flex-direction', 'flex-flow', 'flex-wrap'].includes(node.prop)
			);

			const hasFlexDisplay = selectedNodes.length && hasPropertyValueInContext(rule, 'display', 'flex', 'self');

			selectedNodes.forEach(node => {
				if (!hasFlexDisplay) {
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
