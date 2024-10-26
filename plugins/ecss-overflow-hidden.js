import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/overflow-hidden';
const messages = ruleMessages(ruleName, {
	expected: 'Expected "border-radius" or "aspect-ratio" when using "overflow: hidden".',
});

const meta = {
	url: 'https://example.com/rules/overflow-hidden'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['overflow'].includes(node.prop)
			);

			const hasNeeded = hasPropertyValueInContext(rule, /radius|aspect/, /.*/, 'self');

			selectedNodes.forEach(node => {
				if (!hasNeeded) {
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
