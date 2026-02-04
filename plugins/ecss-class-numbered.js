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
		const numberedClassRegex = /^(?!.*(?:h[1-6]|gri.*\d+|col.*\d+|\(\d+\))).*\d/;
		const singleUnderscoreClassRegex = /\._(?!_)[A-Za-z0-9-]+/g;

		
		postcssRoot.walkRules((rule) => {
			const parent = rule.parent;
			
			if (parent && parent.type === 'atrule' && /^keyframes$/i.test(parent.name)) {
				return;
			}

			const selectorWithoutSingleUnderscoreClasses = rule.selector.replace(
				singleUnderscoreClassRegex,
				''
			);

			if (numberedClassRegex.test(selectorWithoutSingleUnderscoreClasses)) {
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
