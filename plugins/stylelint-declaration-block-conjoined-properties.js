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
			const uniqueDecls = new Map();

			// Collect all declarations in the current rule
			rule.walkDecls((decl) => {
				uniqueDecls.set(decl.prop, decl);
			});

			// Check each declaration
			uniqueDecls.forEach((decl, prop) => {
				const value = decl.value.toLowerCase();

				Object.entries(needed).forEach(([property, neededEntry]) => {
					const matchProperty = matchesStringOrRegExp(prop.toLowerCase(), property);
					const matchValue = matchesStringOrRegExp(value, neededEntry.value);

					if (!matchProperty || !matchValue) return;

					let hasNeeded = false;

					// Determine selector type and scope
					const isChildSelector = /&[\s>]/.test(rule.selector);
					const isSelfCombinedSelector = rule.selector.includes("&") && !isChildSelector;
					const scope = neededEntry.scope || "self";
					let checkNode = scope === "parent" && isChildSelector && parentRule ? parentRule : rule;

					// Walk through the selected checkNode and look for needed declarations
					checkNode.walkDecls((node) => {
						neededEntry.neededDeclaration.forEach((obj) => {
							const propertyMatches = new RegExp(obj.property, "g").test(node.prop.toLowerCase());
							const valueMatches = new RegExp(obj.value, "g").test(node.value.toLowerCase());

							if (propertyMatches && valueMatches) {
								hasNeeded = true;
							}
						});
					});

					// For self-combined selectors, consider them valid if scope is "self"
					if (isSelfCombinedSelector && scope === "self") {
						hasNeeded = true;
					}

					if (!hasNeeded) {
						report({
							message: typeof neededEntry.message === 'function'
							? neededEntry.message(prop, value)
							: neededEntry.message || messages.rejected(neededEntry.neededDeclaration.map(decl => decl.property), decl.toString()),
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
		root.walkRules(processRule);
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);

function validateNeededObject(value) {
	return typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(item => {
		return item.value && Array.isArray(item.neededDeclaration);
	});
}
