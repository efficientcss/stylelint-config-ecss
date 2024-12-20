import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/z-index-static';
const messages = ruleMessages(ruleName, {
	expected: 'Non-static position expected when using "z-index".',
});

const meta = {
	url: printUrl('z-index-static')
}


const ruleFunction = () => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && ['z-index'].includes(node.prop)
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
