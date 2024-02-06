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

const needed = [
	{
		property: "/^(top|right|bottom|left)$/",
		value: "/.*/",
		neededDeclaration: [
			{
				property: "position",
				value: "^((?!static).)*$"
			}
		],
	},
	{
		property: "z-index",
		value: "/.*/",
		neededDeclaration: [
			{
				property: "position",
				value: "^((?!static).)*$"
			}
		],
	},
	{
		property: "overflow",
		value: "hidden",
		ignoreSelectors: [/video|img/],
		neededDeclaration: [
			{
				property: "border-radius",
				value: ".*"
			},
			{
				property: "aspect-ratio",
				value: ".*"
			}
		],
	},
	{
		property: "/padding/",
		value: "/.*/",
		ignoreSelectors: [/(>|\s)?(a|ul|ol|button|input)(:.*)?$/, /link$/],
		neededDeclaration: [
			{
				property: "background",
				value: ".*"
			},
			{
				property: "border",
				value: ".*"
			},
			{
				property: "margin",
				value: ".*"
			},
			{
				property: "box-sizing",
				value: "border-box"
			},
			{
				property: "overflow",
				value: ".*"
			}
		],
	},
];

const rule = (actual) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual });

		if (!validOptions) {
			return;
		}

		root.walkRules((rule) => {
			const uniqueDecls = {};
			rule.walkDecls((decl) => {
				uniqueDecls[decl.prop] = decl;
			});

			function check(prop) {
				const decl = uniqueDecls[prop];
				const value = decl.value;

				needed.forEach((needed) => {
					if (needed.ignoreSelectors?.some(e => rule.selector.match(e))) {
						return;
					}
					const matchProperty = matchesStringOrRegExp(
						prop.toLowerCase(),
						needed.property
					);
					const matchValue = matchesStringOrRegExp(
						value.toLowerCase(),
						needed.value
					);

					const neededDeclaration = needed.neededDeclaration;
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
							messageArgs: [neededDeclaration.map(decl => decl.property), decl.toString()],
							message: messages.rejected(neededDeclaration.map(decl => decl.property), decl.toString()),
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
