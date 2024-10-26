import matchesStringOrRegExp from './matchesStringOrRegExp.js';

export default function optionsMatches(options, propertyName, input) {
	return Boolean(
		options &&
		options[propertyName] &&
		typeof input === 'string' &&
		matchesStringOrRegExp(input, options[propertyName]),
	);
}

