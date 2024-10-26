import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/overflow-hidden';
const messages = ruleMessages(ruleName, {
	expected: 'Expected border-radius or aspect-ratio for overflow hidden.',
});

const meta = {
	url: 'https://example.com/rules/overflow-hidden'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			rule.walkDecls('overflow', (decl) => {
				if (decl.value === 'hidden') {
					const hasBorderRadiusOrAspectRatio = rule.nodes.some(
						(node) => node.prop === 'border-radius' || node.prop === 'aspect-ratio'
					);

					if (!hasBorderRadiusOrAspectRatio) {
						report({
							message: messages.expected,
							messageArgs: [rule.selector],
							node: decl,
							result: postcssResult,
							ruleName,
						});
					}
				}
			});
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
