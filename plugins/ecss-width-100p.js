import stylelint from 'stylelint';
import postcss from "postcss";
import nested from "postcss-nested";
import isPseudoElementSelector from './utils/isPseudoElementSelector.js';
import { notGraphical_selectors } from '../lib/selectors.js';

const {
	createPlugin,
	utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/width-100p';
const messages = ruleMessages(ruleName, {
	expected: '`width: 100%` is generally unnecessary. The default value `auto` shoudl be kept.',
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
		if (isPseudoElementSelector(rule.selector)) {
			return;
		}

		rule.walkDecls('width', (decl) => {
			if (/^100%$/.test(decl.value) && notGraphical_selectors.test(rule.selector)) {
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
