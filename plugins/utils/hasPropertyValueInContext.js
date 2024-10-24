/**
* @param {object} rule
* @param {string} property
* @param {RegExp|string} valuePattern
* @param {string} context
* @returns {boolean}
*/
export default function hasPropertyValueInContext(rule, property, valuePattern, context) {

	const isDescendant = /&\s*(?:>|\s+\.)/.test(rule.selector);
	const isCombined = /&(:[\w-]+|::[\w-]+|\[.*?\]|\.[\w-]+|#\w+)/u.test(rule.selector);

	let currentRule = context == 'parent' && !isCombined ? rule.parent : rule;
	
	while (currentRule && currentRule.type === 'rule') {
		if (currentRule.some((decl) => 
			decl.prop === property && (
				valuePattern instanceof RegExp 
				? valuePattern.test(decl.value)
				: decl.value === valuePattern
			)
		)) {
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
