import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/large-selector-rule';
const messages = ruleMessages(ruleName, {
	expected: 'Avoid changing important properties on wide selectors.',
});

const meta = {
	url: ''
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const structureTagRegex = /^(div|header|footer|section|aside|article)$/;
		const propertyRegex = /^(position|background|display|padding|margin|width|height|border|shadow)/;

		postcssRoot.walkRules((rule) => {

			const selectedNodes = rule.nodes.filter((node) => 
				node.type === 'decl' && node.prop.match(propertyRegex));
			selectedNodes.forEach(node => {
				if (structureTagRegex.test(rule.selector)) {
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
