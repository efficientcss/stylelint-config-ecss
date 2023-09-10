const { lang } = require("./configLang.js");
const messages = require("./messages.js");
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
	results = results[0];
	return results;
}

const createRuleMessages = (selector, prop, dataList) => {
	let message = "";
	for (const data in dataList) {
		const selectorsRegex = dataList[data].find(rule => rule.regex)?.regex;
			const matchedObject = dataList[data].filter(item => item.properties);
			const matchedProperties = matchedObject.find(item => item.properties.some(item => prop.match(item)));
		if(selectorsRegex && selectorsRegex.test(selector)){
			if(matchedProperties) {
				const keywordsArray = matchedProperties?.keywords || ["erreur", "générique"];
				message = printMessage(keywordsArray) + " -> `"+selector+" & "+prop+"`";
			} else {
				const keywordsArray = dataList[data][0].keywords || ["erreur", "générique"];
				message = printMessage(keywordsArray) + " -> `"+selector+"`";
			}
		} else if(!selectorsRegex) {
			const valuesArray = dataList[data].filter(prop => prop.values).flatMap(prop => prop.values);
			const propertiesArray = dataList[data][0].properties;
			const propertyRegex = new RegExp(propertiesArray);
			const keywordsArray = dataList[data][0].keywords;
			if(propertyRegex.test(selector)) {
				message = printMessage(keywordsArray) + " -> `"+selector+" & "+prop+"`";
			}
		}
	}

	return message;
}

const createRuleData = (dataList) => {
	let object = {};
	let array = [];
	let result;
	for (const data in dataList) {
		const selectorsRegex = dataList[data].find(rule => rule.regex)?.regex;
		const valuesArray = dataList[data].filter(item => item.values).flatMap(item => item.values);
		const propertiesArray = dataList[data].filter(item => item.properties).flatMap(item => item.properties);
		if(selectorsRegex && propertiesArray.length > 0){
			object[selectorsRegex] = propertiesArray;
			result = object;
		} else if(propertiesArray.length > 0 && valuesArray.length > 0) {
			object[propertiesArray] = valuesArray;
			result = object;
		} else if(selectorsRegex) {
			array.push(selectorsRegex);
			result = array;
		}
	}
	return result;
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
	[{ properties: ["transform"], values: "/translate\\(-50%/", keywords: ["Méthode", "centrer", "désuète"]}],
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
	"extends": ["stylelint-config-clean-order"],
	"ignoreFiles": ["**/normalize.css", "**/unused/*.css", "**/build.css", "**/build/*.css", "**/x-*.css", "**/*min.css", "**/*quarantine.css"],
	"plugins": [
		"./plugins/stylelint-selector-starts-with-filename",
		"./plugins/stylelint-declaration-block-conjoined-properties",
		"stylelint-z-index-value-constraint",
		"stylelint-csstree-validator",
		"stylelint-declaration-block-no-ignored-properties",
		"stylelint-declaration-strict-value",
		"stylelint-magic-numbers",
		"stylelint-file-max-lines"
	],
	"rules": {
		"max-nesting-depth": [1, {
			message: "Un seul niveau d'imbrication est accepté."
		}],
		"no-unknown-custom-properties": [true, {
			message: "Variable non-définie `%s`"
		}],
		"declaration-property-value-disallowed-list": [
			createRuleData(propValDisallowedList), { 
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, propValDisallowedList) },
				"severity": "warning"
			}],
		"property-disallowed-list": [
			["/padding-/"], {
				"message": "Les dégagements devraient être uniformes. Optez pour une marge sinon. -> %s"
			}],
		"scale-unlimited/declaration-strict-value": [
			["/margin/", "/padding/", "/color/", "/gap/"],
		{
			message: "Utilisez les variables de langage graphique prédéfinies pour `${property}: ${value}`"
		}
		],
		"selector-max-specificity": ["0,2,4", {
			"message": "Spécificité trop élevée pour le sélecteur.`%s`",
			"ignoreSelectors": [pseudoClass_selectors, prefixedClass_selectors]
		}],

		"selector-pseudo-class-disallowed-list": [
			[childPseudoClass_selectors, typePseudoClass_selectors], {
				"severity": "warning"
			}],
		"selector-disallowed-list": [
			createRuleData(selDisallowedList), {
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, selDisallowedList) },
				"splitList": true
			}],
		"rule-selector-property-disallowed-list": [
			createRuleData(selPropDisallowedList), {
				"splitList": true,
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, selPropDisallowedList) }
			}
		],
		"plugin/selector-starts-with-filename": true,
		"plugin/declaration-block-conjoined-properties": true,
		"declaration-no-important": true,
		"plugin/file-max-lines": [200, {"ignore": ["comments", "blankLines"]}],
		"plugin/z-index-value-constraint": {
			"min": 1,
			"max": 10
		},
		"function-calc-no-unspaced-operator": true,
		"function-no-unknown": true,
		"unit-no-unknown": true,
		"csstree/validator": [{
			"ignoreProperties": ["/container/"],
			"ignoreAtrules": ["container"]
		}, {
			"message": "Attention à la validité de votre CSS.`%s: %d`"
		}],
		"number-max-precision": [5, {
			"ignoreUnits": ["em", "rem", "/v/", "s"],
			"ignoreProperties": ["/--/"]
		}],
		"selector-no-vendor-prefix": true,
		"declaration-block-no-duplicate-custom-properties": true,
		"declaration-block-no-duplicate-properties": [true, {
			"message": "Ne répétez pas les propriétés dans un même ensemble.`%s`"
		}],
		"custom-property-no-missing-var-function": true,
		"plugin/declaration-block-no-ignored-properties": [true, {
			"message": "Combinaison de propriétés exclusives `%s & %d`"
		}],
		"block-no-empty": true,
		"no-descending-specificity": null,
		"unit-disallowed-list": [
			["vh", "vw"],
			{
				"message": "Utilisation d'unités inappropriées.`%s`",
				"severity": "warning",
				"ignoreFunctions": ["clamp"]
			}
		],
		"declaration-property-unit-disallowed-list": [{
			"height": ["vh"]
		},{
			"message": "Propriété et unité inappropriées. `%s: %d`"
		}],
		"declaration-no-important": true,
		"selector-max-compound-selectors": [5, {
			"message": "Sélecteur trop complexe.`%s`"
		}],
		"selector-max-class": [3, {
			"message": "Évitez d'enchaîner autant de classes.`%s`"
		}],
		"selector-max-type": [4, {
			"message": "Évitez d'enchaîner autant de sélecteurs de balise.`%s`"
		}],
		"selector-max-universal": [2, {
			"message": "Évitez d'enchaîner autant de sélecteurs universels.`%s`"
		}],
		"no-duplicate-at-import-rules": true,
		"no-irregular-whitespace": true,
		"selector-max-specificity": ["0,2,4", {
			"message": "Spécificité trop élevée pour le sélecteur.`%s`",
			"ignoreSelectors": ["/:.*/", "/.is-*/"]
		}],

		"selector-no-qualifying-type": [null, {
			"ignore": ["attribute"],
			"message": "Attention de ne pas surqualifier vos sélecteurs.`%s`"
		}],
		"selector-max-id": [0,
			{
				"message": "Évitez les sélecteurs d'identifiants.`%s`"
			}
		],
		"magic-numbers/magic-colors": null,
		"magic-numbers/magic-numbers": [true, {
			"acceptedValues": ["/[0-9]+0(%|ms|s|ch|px|rem|em|v.*)?/", "/(12|13)px/", "/^(0|1)?.[0-9]+/"],
			"acceptedNumbers": [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 4, 5, 6, 7, 8, 9, 10, 12, 100],
			"message": "Évitez les chiffres magiques.`%s: %d`"
		}]
	}
}
