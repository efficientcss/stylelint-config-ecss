export default function isPseudoElementSelector(selector) {
	return /^\s*::[\w-]+/u.test(selector);
}
