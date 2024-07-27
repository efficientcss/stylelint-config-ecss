import stylelint from "stylelint";
import postcss from "postcss";
import nested from "postcss-nested";
import path from "path";
import optionsMatches from './utils/optionsMatches.js';

const {
	createPlugin,
	utils: { report, ruleMessages, validateOptions }
} = stylelint;

const ruleName = 'plugin/selector-starts-with-filename';
const messages = ruleMessages(ruleName, {
	rejected: (selector, filename) => `All selectors must begin with filename. ${selector} vs. ${filename}`
});

const isString = (value) => typeof value === 'string' || value instanceof String;

const preprocessCSS = async (css) => {
	const result = await postcss([nested]).process(css, { from: undefined });
	return result.root;
};

const rule = (primary, secondaryOptions) => async (root, result) => {
	const validOptions = validateOptions(
		result,
		ruleName,
		{ actual: primary },
		{
			actual: secondaryOptions,
			possible: { ignoreFiles: [isString] },
			optional: true,
		},
	);

	if (!validOptions) return;

	const inputFile = root.source.input.file;
	const filename = path.parse(inputFile).name.replace(/^_+/, '').split('.')[0];
	const selectorPattern = `^&?\\s*:?\\s*(is\\(|where\\()?((\\* \\+ |\\* ~ )?(\\.[_]?|\\[.*=)?)?(\\")?${filename}(?!(,\\s*\\.[^${filename}].*)+)(?:-[a-zA-Z]+)?(\\")?(\\])?.*`;
	const selectorRegExp = new RegExp(selectorPattern);

	if (optionsMatches(secondaryOptions, 'ignoreFiles', inputFile) || /^\d|^[A-Za-z]-/.test(filename)) return;

	const processedRoot = await preprocessCSS(root.toString());

	processedRoot.walkRules((rule) => {
		rule.selectors.forEach((selector) => {
				if (!selectorRegExp.test(selector)) {
					report({
						messageArgs: [selector, filename],
						message: messages.rejected(selector, filename),
						node: rule,
						word: selector,
						result,
						ruleName,
					});
				}
		});
	});
};

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);
