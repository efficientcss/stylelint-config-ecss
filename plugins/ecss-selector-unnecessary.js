import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/selector-unnecessary';
const messages = ruleMessages(ruleName, {
	expected: 'Only use selectors that are absolutely necessary in your combined selectors.',
});

const meta = {
	url: printUrl('selector-unnecessary')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const overlyStructuredChildrenRegex = /^((.*)[\s](div|footer|section|aside|article|ul|li).*|body.*)\b(p|ul|li|a|button|input|span|h1|h2|h3|h4|h5|h6)\b$/;

		postcssRoot.walkRules((rule) => {
			if (overlyStructuredChildrenRegex.test(rule.selector)) {
				report({
					message: messages.expected,
					messageArgs: [rule.selector],
					node: rule,
					result: postcssResult,
					ruleName,
				});
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
