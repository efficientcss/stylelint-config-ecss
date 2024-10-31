import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/position-prop';
const messages = ruleMessages(ruleName, {
	expected: 'Non-static position expected for positioning properties in a self-combined context without child selectors.',
});

const meta = {
	url: 'https://example.com/rules/position-prop'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['top', 'left', 'right', 'bottom', 'inset'].includes(node.prop)
			);

			const hasNonStaticPosition = selectedNodes.length && hasPropertyValueInContext(rule, 'position', /^(?!.*\bstatic\b).+$/, 'self');

			selectedNodes.forEach(node => {
				if (!hasNonStaticPosition) {
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
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
