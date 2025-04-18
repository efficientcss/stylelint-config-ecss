import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/content-margin';
const messages = ruleMessages(ruleName, {
	expected: 'Only vertical margins (top/bottom) can be applied to content tags.',
});

const meta = {
	url: printUrl('content-margin')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const textTagRegex = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;

		postcssRoot.walkRules((rule) => {
			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && /^margin/.test(node.prop)
			);

			selectedNodes.forEach(node => {
				if (textTagRegex.test(rule.selector) && !/^(margin-top|margin-bottom|margin-block(?:-start|-end)?)$/.test(node.prop)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, node],
						node: node,
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
