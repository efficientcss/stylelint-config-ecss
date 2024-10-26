/**
 * @param {object} rule
 * @param {string} propertyPattern
 * @param {RegExp|string} valuePattern
 * @param {string} context
 * @returns {boolean}
 */
export default function hasPropertyValueInContext(rule, propertyPattern, valuePattern, context) {

	const isDescendant = /&\s*(?:>|\s+\.)/.test(rule.selector);
	const isCombined = /&(:[\w-]+|::[\w-]+|\[.*?\]|\.[\w-]+|#\w+)/u.test(rule.selector);

	let currentRule = context == 'parent' && !isCombined ? rule.parent : rule;

	while (currentRule && currentRule.type === 'rule') {

		const hasPropertyValue = currentRule.some((decl) => (
			propertyPattern instanceof RegExp
			? propertyPattern.test(decl.prop)
			: decl.prop === propertyPattern
		) && (
			valuePattern instanceof RegExp 
			? valuePattern.test(decl.value)
			: decl.value === valuePattern
		));

		if (hasPropertyValue) {
			return true;
		}
		if(context == 'self' && isCombined || context == 'parent' && isDescendant) {
			currentRule = currentRule.parent;
		} else {
			return false;
		}
	}
	return false;
};
