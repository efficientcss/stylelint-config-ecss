import stylelint from "stylelint";

const {
	createPlugin,
	utils: { report, ruleMessages, validateOptions }
} = stylelint;

const ruleName = "plugin/z-index-value-constraint";

const messages = ruleMessages(ruleName, {
	largerThanMax: expected =>
	`Expected z-index to have maximum value of ${expected}.`,
	smallerThanMin: expected =>
	`Expected z-index to have minimum value of ${expected}.`
});

function isNumber(value) {
	return typeof value === "number";
}

function isNegative(value) {
	return value < 0;
}

const _isNaN =
	Number.isNaN ||
	function (value) {
		return value !== value;
	};

function possibleValueTest(value) {
	return isNumber(value) && !isNegative(value);
}


const rule = (options, secondary) => {
	return function (cssRoot, result) {
		const validOptions = validateOptions(
			result,
			ruleName,
			{
				actual: options,
				possible: {
					min: possibleValueTest,
					max: possibleValueTest
				}
			},
			{
				actual: secondary,
				possible: {
					ignoreValues: [isNumber]
				},
				optional: true
			}
		);

		if (!validOptions) {
			return;
		}

		cssRoot.walkRules((rule) => {
			rule.walkDecls("z-index", function (decl) {
				const value = Number(decl.value);

				if (
					_isNaN(value) ||
					(secondary &&
						Array.isArray(secondary.ignoreValues) &&
						secondary.ignoreValues.indexOf(value) > -1)
				) {
					return;
				}

				if (options.max && Math.abs(value) > options.max) {
					report({
						messageArg: [rule.selector, options.max],
						ruleName,
						result,
						node: decl,
						message: messages.largerThanMax(
							isNegative(value) ? options.max * -1 : options.max
						)
					});
				}

				if (options.min && Math.abs(value) < options.min) {
					report({
						ruleName,
						messageArg: [rule.selector, options.min],
						result,
						node: decl,
						message: messages.smallerThanMin(
							isNegative(value) ? options.min * -1 : options.min
						)
					});
				}
			});
		});
	};
}

rule.ruleName = ruleName;
rule.messages = messages;

export default createPlugin(ruleName, rule);
