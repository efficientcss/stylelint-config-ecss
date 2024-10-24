import stylelint from 'stylelint';

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
			// Flag to determine if the current rule is self-combined but not a child selector
			const isDescendant = /&\s*(?:>|\s+\.)/.test(rule.selector);
			const isCombined = /&(:[\w-]+|::[\w-]+|\[.*?\]|\.[\w-]+|#\w+)/u.test(rule.selector);

			const hasFlexOrGridDisplay = (rule) => {
				let currentRule = rule;
				while (currentRule && currentRule.type === 'rule') {
					if (currentRule.some((decl) => 
						decl.prop === 'display' && /flex|grid/.test(decl.value)
					)) {
						return true;
					}
					currentRule = currentRule.parent;
				}
				return false;
			};

			// If "display: flex" is not present, check for flex-specific properties
			rule.walkDecls(/^(flex-direction|flex-wrap|flex-flow)$/, (decl) => {
				const hasDisplayInRule = rule.some(
					(decl) => decl.prop === 'display' && /flex|grid/.test(decl.value)
				);

				if (
					(isDescendant && !hasDisplayInRule) ||
					(isCombined && !hasFlexOrGridDisplay(rule))
				) report({
					message: messages.expected,
					node: decl,
					result: postcssResult,
					ruleName,
				});
			});
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
