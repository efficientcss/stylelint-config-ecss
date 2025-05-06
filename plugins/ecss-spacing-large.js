import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/spacing-large';
const messages = ruleMessages(ruleName, {
	expected: 'Very large spacing. May indicate a composition problem.',
});

const meta = {
	url: ''
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			rule.walkDecls(/^(margin|padding)(-(left|right|inline(-end|start)?))?$/, (decl) => {
				if (/^-?(\d{2,}(em|rem)|\d{3,}px)/.test(decl.value)) {
					report({
						message: messages.expected,
						messageArgs: [rule.selector, decl],
						node: decl,
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
