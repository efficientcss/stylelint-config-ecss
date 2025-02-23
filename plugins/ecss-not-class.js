import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/not-class';
const messages = ruleMessages(ruleName, {
	expected: 'Do not use entities in the :not() selector.',
});

const meta = {
	url: ''
};

const preprocessCSS = async (css) => {
	const result = await postcss([nested]).process(css, { from: undefined });
	return result.root;
};;

const ruleFunction = (primaryOption, secondaryOption, context) => async (postcssRoot, postcssResult) => {
	const processedRoot = await preprocessCSS(postcssRoot.toString());
	const notWithClassesRegex = /:not\((?:\.|\[).*\)/;

	processedRoot.walkRules((rule) => {
		if (notWithClassesRegex.test(rule.selector)) {
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

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
