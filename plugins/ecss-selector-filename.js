import stylelint from "stylelint";
import postcss from "postcss";
import nested from "postcss-nested";
import path from "path";
import isKeyframeSelector from './utils/isKeyframeSelector.js';
import optionsMatches from './utils/optionsMatches.js';
import printUrl from '../lib/printUrl.js';

const {
	createPlugin,
	utils: { report, ruleMessages, validateOptions }
} = stylelint;

const ruleName = 'ecss/selector-filename';
const messages = ruleMessages(ruleName, {
	rejected: (selector, filename) => `All selectors must begin with filename. ${selector} vs. ${filename}`
});

const meta = {
	url: printUrl('component-selector')
}

const isString = (value) => typeof value === 'string' || value instanceof String;
const isRegExp = value => toString.call(value) === '[object RegExp]';

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
			possible: { ignoreFiles: [isString, isRegExp] },
			optional: true,
		},
	);

	if (!validOptions) return;

	const inputFile = path.basename(root.source.input.file);

	const escapeRegex = (str) => {
		return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	};

	const filename = path.parse(inputFile).name.replace(/^_+/, '').split('.')[0];
	const escapedFilename = escapeRegex(filename);
	const selectorPattern = `^(?:\\*\\s*[+~>]\\s*)?&?\\s*:?\\s*(is\\(|where\\()?((\\*\\s*[+~>]\\s*)?(\\.[_]?|\\[.*=)?)?(\\\")?${escapedFilename}(?!(,\\s*\\.[^${escapedFilename}].*)+)(?:-[a-zA-Z]+)?(\\\")?(\\])?.*`;
	const selectorRegExp = new RegExp(selectorPattern);

	if (optionsMatches(secondaryOptions, 'ignoreFiles', inputFile) || /^\d|^[A-Za-z]-/.test(filename)) return;

	const processedRoot = await preprocessCSS(root.toString());

	processedRoot.walkRules((rule) => {
		rule.selectors.forEach((selector) => {
			if (!selectorRegExp.test(selector) && !isKeyframeSelector(selector)) {
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
rule.meta = meta;
export default createPlugin(ruleName, rule);
