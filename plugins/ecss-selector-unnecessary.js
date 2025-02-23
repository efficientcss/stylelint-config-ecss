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
		const overlyStructuredChildrenRegex = /^(?!.*(?:>|~))(?=.*\S\s+\b(?<![-.\w])(?:section|div|footer|aside|article|ul|li|body)\b(?![.-])(?=.*\b(?:p|ul|li|a|button|input|span|h[1-6])\b)).*$/;
		const necessaryStructuredChildrenRegex = /ul ul|li li/;
		postcssRoot.walkRules((rule) => {
			if (overlyStructuredChildrenRegex.test(rule.selector) && !necessaryStructuredChildrenRegex.test(rule.selector)) {
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
