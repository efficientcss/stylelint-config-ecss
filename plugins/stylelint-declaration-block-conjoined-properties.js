import stylelint from "stylelint";
import matchesStringOrRegExp from "./utils/matchesStringOrRegExp.js";

const {
	createPlugin,
	utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "plugin/declaration-block-conjoined-properties";

const messages = ruleMessages(ruleName, {
	rejected: (needed, cause) => `Expected any of "${needed}" with "${cause}"`,
});

const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { 
			actual: primary,
			possible: validateNeededObject
		});

		if (!validOptions) {
			return;
		}

		const needed = primary;

		const processRule = (rule, parentRule = null) => {
			const uniqueDecls = {};

			// Collect all declarations in the current rule
			rule.walkDecls((decl) => {
				uniqueDecls[decl.prop] = decl;
			});

			// Check each declaration
			Object.keys(uniqueDecls).forEach((prop) => {
				const decl = uniqueDecls[prop];
				const value = decl.value;

				Object.keys(needed).forEach((property) => {
					const neededEntry = needed[property];
					const matchProperty = matchesStringOrRegExp(prop.toLowerCase(), property);
					const matchValue = matchesStringOrRegExp(value.toLowerCase(), neededEntry.value);

					if (!matchProperty || !matchValue) {
						return;
					}

					let hasNeeded = false;

					// Determine if this block is a child or self-combined selector
					const isChildSelector = rule.selector.includes("& ") || rule.selector.includes("&>");
					const isSelfCombinedSelector = rule.selector.includes("&.") && !isChildSelector;
					const scope = neededEntry.scope || "self";
					let checkNode = rule;

					if (scope === "parent") {
						if (isChildSelector && parentRule) {
							checkNode = parentRule;
						}
					}

					// Walk through the selected checkNode (either current or parent) and look for needed declarations
					if (checkNode) {
						checkNode.walkDecls((node) => {
							neededEntry.neededDeclaration.every((obj) => {
								const propertyRegex = new RegExp(obj.property, "g");
								const valueRegex = new RegExp(obj.value, "g");
								const propertyMatching = propertyRegex.test(node.prop.toLowerCase());
								const valueMatching = valueRegex.test(node.value.toLowerCase());
								if (propertyMatching && valueMatching) {
									hasNeeded = true;
									return false; // stop iteration
								}
								return true; // continue iteration
							});
						});
					}

					// If it's a self-combined selector, we only care about the properties in the same block
					if (isSelfCombinedSelector && scope === "self") {
						hasNeeded = true;
					}

					if (!hasNeeded) {
						const message = typeof neededEntry.message === 'function'
							? neededEntry.message(prop, value)
							: neededEntry.message;
						report({
							message: message || messages.rejected(neededEntry.neededDeclaration.map(decl => decl.property), decl.toString()),
							node: decl,
							result,
							ruleName,
						});
					}
				});
			});

			// Process child rules recursively, passing the current rule as the parent
			rule.walkRules((childRule) => {
				processRule(childRule, rule);
			});
		};

		// Start processing from the root
		root.walkRules((rule) => {
			processRule(rule);
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);

function validateNeededObject(value) {
	return typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(item => {
		return (
			item.value && Array.isArray(item.neededDeclaration)
		);
	});
}
