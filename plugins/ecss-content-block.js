import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/content-block';
const messages = ruleMessages(ruleName, {
	expected: 'Text tags should remain as "block".',
});

const meta = {
	url: ''
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const textTagRegex = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;

		postcssRoot.walkRules((rule) => {
			rule.walkDecls('display', (decl) => {
				if (textTagRegex.test(rule.selector) && !decl.value.match(/^block$|^inline$|^inline-block$/)) {
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
