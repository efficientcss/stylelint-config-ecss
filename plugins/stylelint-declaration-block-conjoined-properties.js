import stylelint from "stylelint";
import matchesStringOrRegExp from "./utils/matchesStringOrRegExp.js";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions }
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

		root.walkRules((rule) => {
			const uniqueDecls = {};
			rule.walkDecls((decl) => {
				uniqueDecls[decl.prop] = decl;
			});

			function check(prop) {
				const decl = uniqueDecls[prop];
				const value = decl.value;

				Object.keys(needed).forEach((property) => {
					const neededEntry = needed[property];
					if (neededEntry.ignoreSelectors?.some(e => rule.selector.match(e))) {
						return;
					}

					const matchProperty = matchesStringOrRegExp(
						prop.toLowerCase(),
						property
					);
					const matchValue = matchesStringOrRegExp(
						value.toLowerCase(),
						neededEntry.value
					);

					const neededDeclaration = neededEntry.neededDeclaration;
					const neededDeclProp = neededDeclaration.map(decl => decl.property);
					const neededDeclValue = neededDeclaration.map(decl => decl.value);
					let matchDeclValue, matchDeclProp;

					neededDeclValue.forEach((neededVal) => {
						matchDeclValue = matchesStringOrRegExp(
							value.toLowerCase(),
							neededVal
						);
						if (!matchDeclValue) {
							return;
						}
					});

					neededDeclProp.forEach((neededProp) => {
						matchDeclProp = matchesStringOrRegExp(
							prop.toLowerCase(),
							neededProp
						);
						if (!matchDeclProp) {
							return;
						}
					});

					if (!matchProperty || !matchValue) {
						return;
					}

					let hasNeeded = false;

					decl.parent.nodes.forEach((node) => {
						if(node.prop) {
							neededDeclaration.every((obj) => {
							const propertyRegex = new RegExp(obj.property, "g");
							const valueRegex = new RegExp(obj.value, "g");
							const propertyMatching = propertyRegex.test(node.prop.toLowerCase());
							const valueMatching = valueRegex.test(node.value.toLowerCase());
							if (propertyMatching && valueMatching) {
								hasNeeded = true;
								return false;
							}
								return true;
							});
						}
					});

					if(!hasNeeded) {
						report({
							message: neededEntry.message || messages.rejected(neededDeclaration.map(decl => decl.property), decl.toString()),
							node: decl,
							result,
							ruleName,
						});
					}
				});
			}

			Object.keys(uniqueDecls).forEach(check);
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
export default createPlugin(ruleName, rule);

/**
 * Validation function for the needed object
 * @param {any} value
 * @returns {boolean}
 */
function validateNeededObject(value) {
	return typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(item => {
		return (
			item.value && Array.isArray(item.neededDeclaration)
		);
	});
}
