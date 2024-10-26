import stylelint from "stylelint";

const {
	createPlugin,
	utils: { report, ruleMessages, validateOptions }
} = stylelint;

const numbersRuleName = 'magic-numbers/magic-numbers';

const numbersMessages = ruleMessages(numbersRuleName, {
	expected: function expected(hint) {
		return "No-Magic-Numbers ".concat(hint);
	}
});


const numbersRule = function numbersRule(actual, config) {
	return function (root, result) {
		var validOptions = validateOptions(result, numbersRuleName, {
			actual: actual,
			config: config
		});

		if (!validOptions || !actual) {
			return;
		}

		var acceptedValues = config.acceptedValues || [];
		var acceptedNumbers = config.acceptedNumbers || [];
		var ignoreProperties = config.ignoreProperties || [];
		root.walkDecls(function (decl) {
			var value = decl.value;
			var prop = decl.prop; // ignore variables

			if (value.startsWith("var(") || value.startsWith("url") || value.startsWith("U+") || value.startsWith("$") || prop.startsWith("$") || prop.startsWith("--") || ignoreProperties.includes(prop)) {
				return;
			} // ignore values that are no numbers


			var valueRegExp = RegExp(/\d+\.?\d*(em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax|ms|s|fr)?|\.\d+/, 'g');

			if (!valueRegExp.test(value)) {
				return;
			}

			var values = [];
			value.match(valueRegExp).forEach(function (currentValue) {
				if (currentValue) {
					values.push(currentValue);
				}
			});
			var accepted = true;
			var failedValues = [];
			values.forEach(function (val) {
				var theNumber = val.match(/([\d.]+)/)[0];
				var valOK = acceptedValues.some(e => val.match(e)) || acceptedNumbers.some(e => val.match(e));
				accepted = accepted && valOK;

				if (!valOK) {
					failedValues.push(val);
				}
			});

			if (accepted) {
				return;
			} // Ignore if Value is inside a String.


			var isStringWrapped = RegExp(/^(.*\()?['"].*['"]\)?$/g);

			if (isStringWrapped.test(value)) {
				return;
			}

			report({
				index: decl.lastEach,
				messageArgs: [value],
				message: numbersMessages.expected("\"".concat(prop, ": ").concat(value, "\" -> ").concat(failedValues, " failed")),
				node: decl,
				ruleName: numbersRuleName,
				result: result
			});
		});
	};
};

const colorsRuleName = 'magic-numbers/magic-colors';


const colorsMessages = ruleMessages(colorsRuleName, {
	expected: function expected(hint) {
		return "No-Magic-Colors ".concat(hint);
	}
});


const colorsRule = function colorsRule(actual) {
	return function (root, result) {
		var validOptions = validateOptions(result, numbersRuleName, {
			actual: actual
		});

		if (!validOptions || !actual) {
			return;
		}

		root.walkDecls(function (decl) {
			var value = decl.value;
			var prop = decl.prop; // ignore variables

			if (value.startsWith("var(") || value.startsWith("$") || prop.startsWith("$")) {
				return;
			} // ignore values that are no colors


			var isColor = RegExp(/rgba?\( *\d+, *\d+, *\d+(, *0?\.?\d+)? *\)|hsla?\( *\d+, *\d+%, *\d+%(, *0?\.?\d+)? *\)|#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{3}/, 'ig');

			if (!isColor.test(value)) {
				return;
			} // Ignore if Color is inside a String.


			var isStringWrapped = RegExp(/^(.*\()?['"].*['"]\)?$/g);

			if (isStringWrapped.test(value)) {
				return;
			}

			report({
				index: decl.lastEach,
				message: colorsMessages.expected("\"".concat(prop, ": ").concat(value, "\"")),
				node: decl,
				ruleName: colorsRuleName,
				result: result
			});
		});
	};
};

numbersRule.numbersRuleName = numbersRuleName;
numbersRule.messages = numbersMessages;

colorsRule.messages = colorsMessages;
colorsRule.colorsRuleName = colorsRuleName;

var rulesPlugins = [createPlugin(numbersRuleName, numbersRule), createPlugin(colorsRuleName, colorsRule)];

export default rulesPlugins;
