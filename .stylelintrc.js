const { lang } = require("./configLang.js");
const chosenLang = () => {
	let messageLang;
	const osLang = Intl.DateTimeFormat().resolvedOptions().locale;

	if(lang == "auto" && (osLang.includes("en-") || osLang.includes("fr-"))){
		messageLang = osLang
	} else if(lang == "fr" || lang == "en") {
		messageLang = lang;
	} else {
		messageLang = "en";
	}
	return messageLang.split("-")[0];
}

const rootDir = __dirname;
const messageFile = rootDir+"/messages/"+chosenLang()+".txt";
const fs = require("fs");
const messageData = fs.readFileSync(messageFile).toString();
const messageArray = messageData.split(/\r?\n/);

const contentTag_selectorPart = 'p|ul|li|a|button|input|span|h1|h2|h3|h4|h5|h6';
const structureTag_selectorPart = 'div|header|footer|section|aside|article'
const image_selectorPart = '.*img$|.*image|.*svg.*|picture$|icon|i$|before$|after$';

const text_selectors = /^(p|h1|h2|h3|h4|h5|h6)$/;
const tag_selectors = /^(?!.*(${text_selectors}))$/;
const numberedClass_selectors = /\.[a-zA-z-]*[0-9]/;
const unprefixedDescendant_selectors = /^[.][a-zA-Z-_]*\s[.](?!is).*$/;
const unprefixedCombinedClass_selectors = /^.[a-zA-Z >]+[.](?!is-)/;
const pseudoClass_selectors = /:.*/;
const childPseudoClass_selectors = /:.*[child]/;
const typePseudoClass_selectors = /:.*[]/;
const prefixedClass_selectors = /.is-*/;
const notWithClasses_selectors = /(:not\(.*\.)/;
const component_selectors = new RegExp('^(.|\[[a-z-_*]="?)(?!'+image_selectorPart+')[a-zA-Z-_]+("?\])?$');
const notImage_selectors = new RegExp('^((?!'+image_selectorPart+').)*$');
const overlyStructuredChildren_selectors = new RegExp('^.*[\\s]('+structureTag_selectorPart+').*\\b('+contentTag_selectorPart+')\\b$');

const printMessage = (keywords) => {
	let results = messageArray.filter((line) => keywords.every(keyword => line.toLowerCase().includes(keyword)));
	results = results[0].split(': ')[1];
	return results;
}

const createRuleMessages = (selector, prop, selectorList) => {
	for (const selectors in selectorList) {
		const selectorsRegex = selectorList[selectors].find(rule => rule.regex).regex;
		if(selectorsRegex.test(selector)){
			const matchedObject = selectorList[selectors].filter(item => item.properties);
			const matchedProperties = matchedObject.find(item => item.properties.some(item => prop.match(item)));
			const keywordsArray = matchedProperties?.keywords || ["fonctionnalité", "inutile"];

			message = printMessage(keywordsArray) + " -> `"+selector+" et "+prop+"`";
		}
	}

	return message;
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

const selPropDisallowedList = [
	[ { regex: text_selectors },
		{ properties: [/margin(?!-top|-bottom)/], keywords: ["marge", "vertical", "contenu"] },
		{ properties: [/padding/], keywords: ["dégagement", "contenu", "conteneur"] } ],
	[ { regex: tag_selectors },
		{ properties: [/padding/], keywords: ["dégagement", "large"] } ],
	[ { regex: component_selectors },
		{ properties: [/margin/], keywords: ['composante', 'extérieur'] },
		{ properties: [/^width/, /^height/], keywords: ["forcez", "dimensions", "composante"] } ],
	[ { regex: notImage_selectors },
		{ properties: [/^width/, /^height/], keywords: ["images", "dimensions"] } ]
]

const propValDisallowedList = [
	[{ properties: ["position"], values: "/absolute|fixed/", keywords: ["position", "valeur"] }],
	[{ properties: ["/margin|padding/"], values: "/^-?([7-9]\\d|\\d{3,})/", keywords: ["espacement", "large", "problème"] }],
	[{ properties: ["float"], values: "/left|right/", keywords: ["flottement", "image"]}],
	[{ properties: ["translate"],  values: "/-50%/", keywords: ["Méthode", "centrer", "désuète"]}],
	[{ properties: ["flex"], values: "/[0-9]/", keywords: ["Valeur", "invalide", "propriété"]}],
	[{ properties: ["transform"], values: "/translate\(-50%/", keywords: ["Méthode", "centrer", "désuète"]}],
	[{ properties: ["overflow"], values: "hidden", keywords: ["masquer", "défilement"]}]
]

const selDisallowedList = [
	[{ regex: numberedClass_selectors, keywords: ["proscrire", "chiffre", "classe"] }],
	[{ regex: notWithClasses_selectors, keywords: ["entité", "sélecteur", "not"] }],
	[{ regex: unprefixedDescendant_selectors, keywords: ["descendant", "préfixé"] }],
	[{ regex: unprefixedCombinedClass_selectors, keywords: ["combiné", "préfixé"] }],
	[{ regex: overlyStructuredChildren_selectors, keywords: ["sélecteur", "nécessaire"] }]
]

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
					return createRuleMessages(selector, prop, selPropDisallowedList) }
			}
		],
	}
}
