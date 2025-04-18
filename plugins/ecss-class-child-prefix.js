import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/class-child-prefix';
const messages = ruleMessages(ruleName, {
	rejected: "Descendant classes should always be prefixed.",
});

const meta = {
	url: printUrl('class-child-prefix')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const unprefixedDescendantRegex = /(?<![(:,]\s*)(?:\s+|>\s*)\.(?!is-|as-|on-|to-|with-|and-|now-|fx-|for-|__)[a-zA-Z0-9_-]+/;

		postcssRoot.walkRules((rule) => {
			for (const selector of rule.selectors) {
				if (unprefixedDescendantRegex.test(selector)) {
					report({
						message: messages.rejected,
						messageArgs: [rule.selector],
						node: rule,
						result: postcssResult,
						ruleName,
					});
				}
			}
		});
	};
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
