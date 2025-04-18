import stylelint from 'stylelint';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/class-numbered';
const messages = ruleMessages(ruleName, {
	expected: 'Avoid numbers in class names.',
});

const meta = {
	url: printUrl('class-numbered')
}


const ruleFunction = (primaryOption, secondaryOption, context) => {
	return (postcssRoot, postcssResult) => {
		const numberedClassRegex = /^(?!.*(?:h[1-6]|grid-\d+|col-\d+)).*\d/;

		postcssRoot.walkRules((rule) => {
			if (numberedClassRegex.test(rule.selector)) {
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
