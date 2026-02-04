import stylelint from 'stylelint';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/content-block';
const messages = ruleMessages(ruleName, {
	expected: 'Text tags should remain as "block" unless including a pseudo-element.',
});

const meta = {
	url: ''
};

const textTagRegex = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;
const pseudoElementRegex = /^&:{1,2}(before|after)$/;

const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		postcssRoot.walkRules((rule) => {
			rule.walkDecls('display', (decl) => {
				const displayValue = decl.value;
				const selector = rule.selector;

				if (!textTagRegex.test(selector)) return;
				if (/^(contents|block|inline|inline-block|none)$/.test(displayValue)) return;

				const hasPseudoElementChild = rule.nodes.some(
					node =>
					node.type === 'rule' &&
					pseudoElementRegex.test(node.selector)
				);

				if (!hasPseudoElementChild) {
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
