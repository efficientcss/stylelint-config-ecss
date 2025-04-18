import stylelint from 'stylelint';
import hasPropertyValueInContext from './utils/hasPropertyValueInContext.js';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/padding-constraints';
const messages = ruleMessages(ruleName, {
	expected: 'Paddings should first be uniform and require graphical constraints.',
});

const meta = {
	url: printUrl('padding-constraints')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const ignoreSelectorsRegex = /(>|\s)?(is:|where:)?.*(a|ul|ol|button|input)(\))?(:.*)?$/;

		postcssRoot.walkRules((rule) => {
			if (!ignoreSelectorsRegex.test(rule.selector)) {
				const selectedNodes = rule.nodes.filter((node) => 
					node.type === 'decl' && /^padding/.test(node.prop)
				);

				const hasNeededProp = selectedNodes.length && hasPropertyValueInContext(rule, /(text-indent|background|border|margin|box-sizing|overflow)/, /.*/, 'self');

				selectedNodes.forEach(node => {
					if (!hasNeededProp) {
						report({
							message: messages.expected,
							messageArgs: [rule.selector, node.prop],
							node,
							result: postcssResult,
							ruleName,
						});
					}
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
