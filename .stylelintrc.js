const fs = require("fs");
const global_data = fs.readFileSync("commentaires.txt").toString();

const text_selectors = /^(p|h1|h2|h3|h4|h5|h6)$/;
const tag_selectors = /^(?!.*(${text_selectors}))$/;
const numberedClass_selectors = /\.[a-zA-z-]*[0-9]/;
const unprefixedDescendant_selectors = /^[.][a-zA-Z-_]*\s[.](?!is).*$/;
const unprefixedCombinedClass_selectors = /^.[a-zA-Z >]+[.](?!is-)/;
const pseudoClass_selectors = /:.*/;
const childPseudoClass_selectors = /:.*[child]/;
const typePseudoClass_selectors = /:.*[]/;
const prefixedClass_selectors = /.is-*/;

const contentTag_selectorPart = 'p|ul|li|a|button|input|span|h1|h2|h3|h4|h5|h6';
const structureTag_selectorPart = 'div|header|footer|section|aside|article'
const image_selectors = '.*img$|.*image|.*svg.*|picture$|icon|i$|before$|after$';
const notWithClasses_selectors = /(:not\(.*\.)/;

const component_selectors = new RegExp('^(.|\[[a-z-_*]="?)(?!'+image_selectors+')[a-zA-Z-_]+("?\])?$');
const notImage_selectors = new RegExp('^((?!'+image_selectors+').)*$');
const overlyStructuredChildren_selectors = new RegExp('^.*[\\s]('+structureTag_selectorPart+').*\\b('+contentTag_selectorPart+')\\b$');

let data_array = global_data.split(/\r?\n/);
var keywords = ['répét', 'css'];

let printComment = (keywords) => {
	let results = data_array.filter((line) => keywords.every(keyword => line.toLowerCase().includes(keyword)));
	results = results[0].split(': ')[1];
	return results;
}

const propCases = (prop, cases = []) => {
	let defaultComment = cases.filter(i => i.generic).map(i => i.generic)[0];
	let comment = printComment(defaultComment);
	for(let i = 0; i < cases.length; i += 1){
		if(cases[i].properties && cases[i].properties.some(regex => regex.test(prop))){
			comment = printComment(cases[i].keywords)
		}
	}
	return comment;
}


const selPropDisallowedList = {
	text_selectors: [
		{ regex: text_selectors },
		{ properties: [/margin(?!-top|-bottom)/], keywords: ["rythme", "vertical", "texte"] },
		{ properties: [/padding/], keywords: ["dégagement", "inégal"] },
		{ generic: ['propriété', 'sélecteur', 'éviter'] }
	],
	tag_selectors: [
		{ regex: tag_selectors },
		{ properties: [/padding/], keywords: ["dégagement", "inégal"] }
	],
	component_selectors: [
		{ regex: component_selectors },
		{ properties: [/margin/] },
		{ properties: [/^width/, /^height/] }
	],
	notImage_selectors: [
		{ regex: notImage_selectors },
		{ properties: [/^width/, /^height/] }
	]
}

const createRuleSelectors = (selectorList) => {
	let object = {};

	for (const selectors in selectorList) {
		const selectorsRegex = selectorList[selectors].find(rule => rule.regex).regex;
		const propertiesArray = selectorList[selectors].filter(prop => prop.properties).flatMap(prop => prop.properties);
		object[selectorsRegex] = propertiesArray;
	}
	return object;
}

module.exports = {
	"rules": {
		"declaration-property-value-disallowed-list": [{
			"position": "/absolute|fixed/",
			"/margin|padding/": "/^-?([7-9]\\d|\\d{3,})/",
			"float": "/left|right/",
			"translate": "/50%/",
			"flex": "/[0-9]/",
			"transform": "/translate\\(-50%/",
			"overflow": "hidden"
		},{ 
			"message": "`%s: %d` — Utilisation inappropriée de propriétés. voir [https://ecss.info](https://ecss.info)",
			"severity": "warning"
		}],
		"property-disallowed-list": [
			["/padding-/"], {
				"message": "Les dégagements devraient être uniformes et nécessiter un arrière-plan. Optez pour une marge sinon. -> %s"
			}],
		"selector-max-specificity": ["0,2,4", {
			"message": "Spécificité trop élevée pour le sélecteur.`%s`",
			"ignoreSelectors": [pseudoClass_selectors, prefixedClass_selectors]
		}],

		"selector-pseudo-class-disallowed-list": [
			[childPseudoClass_selectors, typePseudoClass_selectors], {
				"severity": "warning"
			}],
		"selector-disallowed-list": [
			[numberedClass_selectors,
				notWithClasses_selectors,
				unprefixedDescendant_selectors,
				unprefixedCombinedClass_selectors,
				overlyStructuredChildren_selectors], {
					"message": "Sélecteur inadéquat.`%s`",
					"splitList": true
				}],
		"rule-selector-property-disallowed-list": [
			createRuleSelectors(selPropDisallowedList), {
				"splitList": true,
				"message": (selector, prop) => {
					let comment = '';
					if(selector.match(text_selectors)){
						comment = propCases(prop, [
							{ properties: [/margin(?!-top|-bottom)/], keywords: ["rythme", "vertical", "texte"] },
							{ properties: [/padding/], keywords: ["dégagement", "inégal"] },
							{ generic: ['propriété', 'sélecteur', 'éviter'] }
						]);
					} else if(selector.match(component_selectors)){
						comment = printComment(['composante', 'extérieur']);

					}
					comment += " -> `"+selector+" et "+prop+"`"
					return comment;
				}
			}
		],
	}
}
