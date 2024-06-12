import matchesStringOrRegExp from './matchesStringOrRegExp.js';

export default function optionsMatches(options, propertyName, input) {
	console.log(options[propertyName]);
	return Boolean(
		options &&
			options[propertyName] &&
			typeof input === 'string' &&
			matchesStringOrRegExp(input, options[propertyName]),
	);
}

