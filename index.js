import configLang from "./lib/configLang.js";
import ecssmessages from "./lib/messages.js";
const { lang } = configLang;
const messages = ecssmessages;
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

const contentTag_selectorPart = 'p|ul|li|a|button|input|span|h1|h2|h3|h4|h5|h6';
const structureTag_selectorPart = 'div|header|footer|section|aside|article'
const graphical_selectorPart = 'image|img|video|hr|picture|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea';
const prefixed_selectorPart = 'is-|as-|on-|to-|with-|and-|now-|fx-|for-|__';

const text_selectors = /^(.*(p|h1|h2|h3|h4|h5|h6|blockquote))\)?$/;
const numberedClass_selectors = /\.(?!(h[1-6]|grid-[0-9]+|col-[0-9]+)$)[a-zA-Z-]*[0-9]+/;
const unprefixedDescendant_selectors = new RegExp('^(& |\.?.*)\\s[.](?!'+prefixed_selectorPart+').*$');
const unprefixedCombinedClass_selectors = new RegExp('^(&|.[a-zA-Z-_]*)[.](?!'+prefixed_selectorPart+').*$');
const pseudoClass_selectors = /:.*/;
const childPseudoClass_selectors = /:.*[child]/;
const typePseudoClass_selectors = /:.*/;
const prefixedClass_selectors = /.(${prefixed_selectorPart}).*/;
const notWithClasses_selectors = /(:not\(.*\.)/;
const component_selectors = new RegExp('^(?!& )(.|\[[a-z-_]*="?)(?!'+graphical_selectorPart+')[a-zA-Z-_]+("?\])?$');
const notGraphical_selectors = new RegExp('^(?!.*(?:'+graphical_selectorPart+')).*$');
const overlyStructuredChildren_selectors = new RegExp('^.*[\\s](div|footer|section|aside|article).*\\b('+contentTag_selectorPart+')\\b$');
const tagScopedClass_selectors = new RegExp('^('+structureTag_selectorPart+') (.|\[[a-z-_]*="?).*("?\])?$')

const printMessage = (keywordId, source, problem) => {
	let results = messages[keywordId][chosenLang()];
	if(source || problem) {
		results += " `"
	}
	if(source) {
		results += source
	}
	if(source && problem) {
		results += " & "
	}
	if(problem) {
		results += problem
	}
	if(source || problem) {
		results += "`"
	}
	return results;
}

const createRuleMessages = (source, problem, dataList) => {
	let message = "";

	for (const data in dataList) {
		const selectorsRegex = dataList[data].find(rule => rule.regex)?.regex;
		const matchedObject = dataList[data].filter(item => item.properties);
		const matchedProperties = matchedObject.find(item => item.properties.some(item => problem.match(item)));
		if(selectorsRegex && selectorsRegex.test(source) && matchedProperties){
			const keywordId = matchedProperties?.keywordId || ["generic-error"];
			message = printMessage(keywordId, source, problem);
		} else if(selectorsRegex && selectorsRegex.test(source) && !matchedObject[0]?.properties) {
			const keywordId = dataList[data][0].keywordId || ["generic-error"];
			message = printMessage(keywordId, source);
		} else if(!selectorsRegex) {
			const valuesArray = dataList[data].filter(problem => problem.values).flatMap(problem => problem.values);
			const propertyRegex = dataList[data][0].properties[0];
			const keywordId = dataList[data][0].keywordId;
			if(propertyRegex.test(source)) {
				message = printMessage(keywordId, source, problem);
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
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/margin(?!-top|-bottom)/], keywordId: "content-margin" },
		{ properties: [/padding/], keywordId: "content-padding" },
		{ properties: [/^width/, /^height/], keywordId: "selector-dimensions" } ],
	[ { regex: component_selectors },
		{ properties: [/margin/], keywordId: "component-outside" },
		{ properties: [/^width/, /^height/], keywordId: "component-dimensions" } ],
	[ { regex: notGraphical_selectors },
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/^width/, /^height/], keywordId: "selector-dimensions" } ],
	[ { regex: component_selectors },
		{ properties: [/margin/], keywordId: "component-outside" },
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/^width/, /^height/], keywordId: "component-dimensions" } ]
]

const propValDisallowedList = [
	[{ properties: [/position/], values: "/absolute|fixed/", keywordId: "position-sensitive" }],
	[{ properties: [/margin|padding/], values: "/^-?([7-9]\\d|\\d{3,})/", keywordId: "spacing-large" }],
	[{ properties: [/translate/],  values: "/-50%/", keywordId: "technique-centered"}],
	[{ properties: [/^flex$/], values: "/[0-9]/", keywordId: "flex-shorthand"}],
	[{ properties: [/transform/], values: "/translate\\(-50%/", keywordId: "technique-centered"}],
]

const selDisallowedList = [
	[{ regex: numberedClass_selectors, keywordId: "class-numbered" }],
	[{ regex: notWithClasses_selectors, keywordId: "not-class" }],
	[{ regex: unprefixedDescendant_selectors, keywordId: "class-child-prefix" }],
	[{ regex: unprefixedCombinedClass_selectors, keywordId: "class-combined-prefix" }],
	[{ regex: tagScopedClass_selectors, keywordId: "tag-scoped-class" }],
	[{ regex: overlyStructuredChildren_selectors, keywordId: "selector-unnecessary" }]
]

export default {
	"plugins": [
		"./plugins/stylelint-selector-starts-with-filename",
		"./plugins/stylelint-declaration-block-conjoined-properties",
		"./plugins/stylelint-z-index-value-constraint",
		"./plugins/stylelint-csstree-validator",
		"./plugins/stylelint-declaration-block-no-ignored-properties",
		"./plugins/stylelint-magic-numbers",
		"stylelint-file-max-lines"
	],
	"rules": {
		"selector-nested-pattern": ["^&", {
			message: printMessage("nesting-pattern"),
			"splitList": true
		}],
		"max-nesting-depth": [2, {
			message: printMessage("nesting-level")
		}],
		"declaration-property-value-disallowed-list": [
			createRuleData(propValDisallowedList), { 
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, propValDisallowedList) },
				"severity": "warning"
			}],
		"selector-max-specificity": ["0,2,4", {
			"message": (selector) => { 
					return printMessage("specificity-max", selector)},
			"ignoreSelectors": [pseudoClass_selectors, prefixedClass_selectors]
		}],

		"selector-pseudo-class-disallowed-list": [
			[childPseudoClass_selectors, typePseudoClass_selectors], {
				"severity": "warning",
				"message": (selector) => { 
					return printMessage("pseudo-disallowed", selector)}
			}],
		"selector-disallowed-list": [
			createRuleData(selDisallowedList), {
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, selDisallowedList) },
				"splitList": true
			}],
		"rule-selector-property-disallowed-list": [
			createRuleData(selPropDisallowedList), {
				"ignore": ["keyframe-selectors"],
				"message": (selector, prop) => { 
					return createRuleMessages(selector, prop, selPropDisallowedList) }
			}
		],
		"plugin/selector-starts-with-filename": [true, {
			"message": (selector, prop) => { 
					return printMessage("component-selector", selector, prop)},
			"ignoreFiles": ["**/quarantine.css"]
		}],
		"plugin/declaration-block-conjoined-properties": [true, {
			"message": (selector, prop) => { 
					return printMessage("property-conjoined", selector, prop)}
		}],
		"plugin/file-max-lines": [200, {
			"ignore": ["comments", "blankLines"],
			"severity": "warning",
			"message": printMessage("file-lines")
		}],
		"plugin/z-index-value-constraint": [{
			"min": 0,
			"max": 10
		}, {
			"message": (selector, prop) => { 
					return printMessage("z-index-band", selector, prop)}
		}],
		"function-calc-no-unspaced-operator": [true, {
			"message": (selector, prop) => { 
					return printMessage("calc-unspaced", selector, prop)}
		}],
		"function-no-unknown": [true, {
			"message": (selector) => { 
					return printMessage("function-unknown", selector)}
		}],

		"unit-no-unknown": [true, {
			"message": (selector, prop) => { 
					return printMessage("unit-unknown", selector, prop)}
		}],

		"csstree/validator": [{
			"ignoreProperties": ["/container/"],
			"ignoreValue": "clamp",
			"ignoreAtrules": ["container"]
		}, {
			"message": (selector, prop) => { 
					return printMessage("syntax-invalid", selector, prop)}
		}],
		"number-max-precision": [5, {
			"ignoreUnits": ["em", "rem", "/v/", "s"],
			"ignoreProperties": ["/--/"],
			"message": (selector, prop) => { 
					return printMessage("floating-max", selector, prop)}
		}],
		"declaration-block-no-duplicate-custom-properties": [true, {
			"message": (selector) => { 
					return printMessage("custom-property-duplicate", selector)}
		}],
		"declaration-block-no-duplicate-properties": [true, {
			"message": (selector) => { 
					return printMessage("property-duplicate", selector)}
		}],
		"custom-property-no-missing-var-function": [true, {
			"message": (selector, prop) => { 
					return printMessage("var-function-missing", selector, prop)}
		}],
		"plugin/declaration-block-no-ignored-properties": [true, {
			"message": (selector, prop) => { 
					return printMessage("property-ignored", selector, prop)}
		}],
		"block-no-empty": [true, {
			"message": () => { 
					return printMessage("block-empty")}
		}],

		"unit-disallowed-list": [
			["vh", "vw"],
			{
				"message": (selector, prop) => { 
					return printMessage("unit-disallowed", selector, prop)},
				"severity": "warning",
				"ignoreFunctions": ["clamp"]
			}
		],
		"declaration-property-unit-disallowed-list": [{
			"height": ["vh"]
		},{
			"message": (selector, prop) => { 
					return printMessage("property-unit-disallowed", selector, prop)}
		}],
		"declaration-no-important": [true, {
			"message": (selector, prop) => { 
					return printMessage("declaration-important", selector, prop)}
		}],

		"selector-max-compound-selectors": [5, {
			"message": (selector, prop) => { 
					return printMessage("selector-max", selector, prop)}
		}],
		"selector-max-class": [3, {
			"message": (selector, prop) => { 
					return printMessage("class-max", selector, prop)}
		}],
		"selector-max-type": [4, {
			"message": (selector, maxValue) => { 
					return printMessage("type-max", undefined, maxValue)}
		}],
		"selector-max-universal": [2, {
			"message": (selector, prop) => { 
					return printMessage("universal-max", selector, prop)}
		}],
		"no-duplicate-at-import-rules": [true, {
			"message": (selector, prop) => { 
					return printMessage("import-duplicate", selector, prop)}
		}],
		"no-irregular-whitespace": [true, {
			"message": (selector, prop) => { 
					return printMessage("whitespace-irregular", selector, prop)}
		}],
		"selector-no-qualifying-type": [true, {
			"ignore": ["attribute"],
			"message": (selector, prop) => { 
					return printMessage("selector-qualified", selector, prop)}
		}],
		"selector-max-id": [0, {
			"message": (selector, prop) => { 
					return printMessage("selector-id", selector, prop)}
		}],
		"magic-numbers/magic-colors": null,
		"magic-numbers/magic-numbers": [true, {
			"ignoreProperties": ["font-weight", "background", "background-image", "content"],
			"acceptedValues": [/[0-9]+0(%|ms|s|ch|px|rem|em|fr|v.*)?/, /(12|13)px/, /^(0|1)?\.[0-9]+(%|ms|s|ch|px|rem|em|v.*)?/],
			"acceptedNumbers": [/[0-9]/, /^(0|1)?\.[0-9]*$/],
			"message": (selector, prop) => { 
					return printMessage("magic-number", selector, prop)}
		}]
	}
}
