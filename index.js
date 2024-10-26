import printMessage from './lib/printmessage.js';
import * as selectors from './lib/selectors.js';

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
	[ { regex: selectors.structureTag_selectors },
		{ properties: [/^position$|background|display|padding|margin|width|height|border|shadow/], keywordId: "large-selector-rule" } ],
	[ { regex: selectors.text_selectors },
		{ properties: [/display/], keywordId: "content-block" },
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/margin(?!-top|-bottom|-block)/], keywordId: "content-margin" },
		{ properties: [/padding/], keywordId: "content-padding" },
		{ properties: [/^width/, /^height/], keywordId: "selector-dimensions" } ],
	[ { regex: selectors.component_selectors },
		{ properties: [/margin/], keywordId: "component-outside" },
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/^width/, /^height/], keywordId: "component-dimensions" } ],
	[ { regex: selectors.notGraphical_selectors },
		{ properties: [/float/], keywordId: "content-float" },
		{ properties: [/^width/, /^height/], keywordId: "selector-dimensions" } ]
]

const propValDisallowedList = [
	[{ properties: [/margin|padding/], values: "/^-?(\\d{2,}(em|rem)|\\d{3,}px)/", keywordId: "spacing-large" }],
	[{ properties: [/position/], values: "/absolute|fixed/", keywordId: "position-sensitive" }],
	[{ properties: [/translate/],  values: "/-50%/", keywordId: "technique-centered"}],
	[{ properties: [/^flex$/], values: "/^[0-9]*[a-z]*$/", keywordId: "flex-shorthand"}],
	[{ properties: [/width$/], values: "/^(?!100%)\\d+%$/", keywordId: "relative-width"}],
	[{ properties: [/transform/], values: "/translate\\(-50%/", keywordId: "technique-centered"}],
]

const selDisallowedList = [
	[{ regex: selectors.numberedClass_selectors, keywordId: "class-numbered" }],
	[{ regex: selectors.notWithClasses_selectors, keywordId: "not-class" }],
	[{ regex: selectors.unprefixedDescendant_selectors, keywordId: "class-child-prefix" }],
	[{ regex: selectors.unprefixedCombinedClass_selectors, keywordId: "class-combined-prefix" }],
	[{ regex: selectors.tagScopedClass_selectors, keywordId: "tag-scoped-class" }],
	[{ regex: selectors.overlyStructuredChildren_selectors, keywordId: "selector-unnecessary" }]
]

const conjoinedPropList = {
	"/^(align-(items|content)|justify-(items|content)|gap)$/": {
		"value": "/.*/",
		message: (property, value) => printMessage("align-display", property, value),
		"neededDeclaration": [
			{
				"property": "display",
				"value": "flex|grid"
			}
		]
	},
	"/^(flex-direction|flex-wrap|flex-flow)$/": {
		"value": "/.*/",
		message: (property, value) => printMessage("flex-prop", property, value),
		"neededDeclaration": [
			{
				"property": "display",
				"value": "flex"
			}
		]
	},
	"/^(top|right|bottom|left)$/": {
		"value": "/.*/",
		message: (property, value) => printMessage("position-prop", property, value),
		"neededDeclaration": [
			{
				"property": "position",
				"value": "^((?!static).)*$"
			}
		]
	},
	"z-index": {
		"value": "/.*/",
		message: (property, value) => printMessage("z-index-static", property, value),
		"neededDeclaration": [
			{
				"property": "position",
				"value": "^((?!static).)*$"
			}
		]
	},
	"overflow": {
		"value": "hidden",
		message: (property, value) => printMessage("overflow-hidden", property, value),
		"ignoreSelectors": [/video|img|picture/],
		"neededDeclaration": [
			{
				"property": "border-radius",
				"value": ".*"
			},
			{
				"property": "aspect-ratio",
				"value": ".*"
			}
		]
	},
	"/padding-/": {
		"value": "/.*/",
		"ignoreSelectors": [/(>|\s)?(a|ul|ol|button|input)(:.*)?$/, /link$/],
		message: (property, value) => printMessage("padding-constraints", property, value),
		"neededDeclaration": [
			{
				"property": "text-indent",
				"value": ".*"
			},
			{
				"property": /padding$/,
				"value": ".*"
			},
			{
				"property": "background",
				"value": ".*"
			},
			{
				"property": "border",
				"value": ".*"
			},
			{
				"property": "margin",
				"value": ".*"
			},
			{
				"property": "box-sizing",
				"value": "border-box"
			},
			{
				"property": "overflow",
				"value": ".*"
			}
		]
	}
} 

export default {
	"plugins": [
		"./plugins/stylelint-selector-starts-with-filename",
		"./plugins/stylelint-declaration-block-conjoined-properties",
		"./plugins/stylelint-z-index-value-constraint",
		"./plugins/stylelint-csstree-validator",
		"./plugins/stylelint-declaration-block-no-ignored-properties",
		"./plugins/stylelint-magic-numbers",
		"./plugins/stylelint-no-commented-code",
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
			"ignoreSelectors": [selectors.pseudoClass_selectors, selectors.prefixedClass_selectors]
		}],

		"selector-pseudo-class-disallowed-list": [
			[selectors.childPseudoClass_selectors, selectors.typePseudoClass_selectors], {
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
			"ignoreFiles": ["quarantine.css", "main.css"]
		}],
		"plugin/declaration-block-conjoined-properties": [
			conjoinedPropList
		],
		"plugin/no-commented-code": [true, {
			"message": printMessage("commented-code")
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
			"ignoreValues": [-1],
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
			"message": (selector, maxValue) => { 
				return printMessage("selector-max", selector, undefined, maxValue+"..")}
		}],
		"selector-max-class": [3, {
			"message": (selector, maxValue) => { 
				return printMessage("class-max", selector, undefined, maxValue+".")}
		}],
		"selector-max-type": [4, {
			"message": (selector, maxValue) => { 
				return printMessage("type-max", selector, undefined, maxValue+"..")}
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
