import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/overflow-hidden';
const messages = ruleMessages(ruleName, {
	expected: 'Expected "border-radius" or "aspect-ratio" when using "overflow: hidden".',
});

const meta = {
	url: printUrl('overflow-hidden')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['overflow'].includes(node.prop) && ['hidden'].includes(node.value)
			);
			const ignoreSelectors = /picture/;
			const hasNeeded = hasPropertyValueInContext(rule, /radius|aspect/, /.*/, 'self');

			selectedNodes.forEach(node => {
				if (!hasNeeded && !ignoreSelectors.test(rule.selector)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector],
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
