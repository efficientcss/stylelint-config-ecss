import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/position-sensitive';
const messages = ruleMessages(ruleName, {
	expected: 'This positioning value is tricky. Caution is required.',
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
	processedRoot.walkRules((rule) => {
		rule.walkDecls('position', (decl) => {
			if (/absolute|fixed/.test(decl.value)) {
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

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
