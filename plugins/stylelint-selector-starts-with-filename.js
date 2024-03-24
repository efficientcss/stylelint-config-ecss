import stylelint from "stylelint";
import isKeyframeSelector from './utils/isKeyframeSelector.js';
import path from "path";

function isString(value) {
	return typeof value === 'string' || value instanceof String;
}

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions }
} = stylelint;


const ruleName = 'plugin/selector-starts-with-filename';
const messages = ruleMessages(ruleName, {
	rejected: (selector, filename) => `All selectors must begin with filename. ${selector} vs. ${filename}`
});

const findRootSelector = (node) => {
    let current = node;
    let foundParent = current;
    
    while (current.parent) {
        if (current.parent.type === 'rule') {
            foundParent = current.parent;
        }
        current = current.parent;
    }

    return foundParent.selector;
};

const rule = (primary, secondaryOptions) => {
	return (root, result) => {
		const validOptions = validateOptions(
			result, 
			ruleName,
			{ actual: primary },
			{
				actual: secondaryOptions,
				possible: {
					ignoreFiles: [isString],
				},
				optional: true,
			},
		);
		const inputFile = root.source.input.file;
		const filename = path.parse(inputFile).name.replace(/^_+/, '').split('.')[0];
		const selectorPattern = '^:?(is\\(|where\\()?((\\* \\+ |\\* ~ )?(\\.[_]?|\\[.*=)?)?(\")?'+filename+'(?:-[a-zA-Z]+)?(\")?(\\])?.*';
		const selectorRegExp = new RegExp(selectorPattern);

		if (!validOptions) {
			return;
		}

		// skip filenames starting with digit or "x-" pattern
		if (filename.match(/^\d/) || filename.startsWith("x-")) {
			return;
		}



		root.walkRules((rule) => {
			rule.selectors.forEach((selector) => {
				if (isKeyframeSelector(selector)) {
					return;
				}
				const rootSelector = findRootSelector(rule);
				if(!selectorRegExp.test(rootSelector)) { 
					report({
						messageArgs: [selector, filename],
						message: messages.rejected(selector, filename),
						node: rule,
						result,
						ruleName,
					});
				}
			});
		});
	}
}

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);
