/**
 * @param {object} rule
 * @param {string} propertyPattern
 * @param {RegExp|string} valuePattern
 * @param {string} context
 * @returns {boolean}
 */
export default function hasPropertyValueInContext(rule, propertyPattern, valuePattern, context) {

	const isDescendant = /&\s*(?:>|\s+\.\w+|:{1,2}(?:before|after))/.test(rule.selector);
	const isCombined = /&(:[\w-]+|::[\w-]+|\[.*?\]|\.[\w-]+|#\w+)/u.test(rule.selector);

	const findNearestRule = (node) => {
		let current = node;
		while (current && current.type !== 'rule') {
			current = current.parent;
		}
		return current;
	};

	let currentRule = findNearestRule(context == 'parent' && !isCombined ? rule.parent : rule);

	while (currentRule) {

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
			currentRule = findNearestRule(currentRule.parent);
		} else {
			return false;
		}
	}
	return false;
};
