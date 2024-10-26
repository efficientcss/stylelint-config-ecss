import printMessage from './lib/printmessage.js';
import * as selectors from './lib/selectors.js';

export default {
	"plugins": [
		"./plugins/ecss-align-display",
		"./plugins/ecss-z-index-static",
		"./plugins/ecss-overflow-hidden",
		"./plugins/ecss-large-selector-rule",
		"./plugins/ecss-content-block",
		"./plugins/ecss-class-numbered",
		"./plugins/ecss-not-class",
		"./plugins/ecss-selector-dimensions",
		"./plugins/ecss-relative-width",
		"./plugins/ecss-flex-prop",
		"./plugins/ecss-flex-children",
		"./plugins/ecss-technique-centered",
		"./plugins/ecss-padding-constraints",
		"./plugins/ecss-component-outside",
		"./plugins/ecss-spacing-large",
		"./plugins/ecss-position-prop",
		"./plugins/ecss-pseudo-disallowed",
		"./plugins/ecss-tag-scoped-class",
		"./plugins/ecss-class-child-prefix",
		"./plugins/ecss-content-float",
		"./plugins/ecss-component-dimensions",
		"./plugins/ecss-content-margin",
		"./plugins/ecss-class-combined-prefix",
		"./plugins/ecss-content-padding",
		"./plugins/ecss-selector-filename",
		"./plugins/stylelint-z-index-value-constraint",
		"./plugins/stylelint-csstree-validator",
		"./plugins/ecss-ignored-properties",
		"./plugins/stylelint-magic-numbers",
		"./plugins/ecss-commented-code",
		"stylelint-file-max-lines"
	],
	"rules": {
		"ecss/align-display": [true, {
			"message": (selector) => {
				return printMessage("align-display", selector);
			}
		}],
		"ecss/z-index-static": [true, {
			"message": (selector) => {
				return printMessage("z-index-static", selector);
			}
		}],
		"ecss/overflow-hidden": [true, {
			"message": (selector) => {
				return printMessage("overflow-hidden", selector);
			}
		}],
		"ecss/large-selector-rule": [true, {
			"message": (selector) => {
				return printMessage("large-selector-rule", selector);
			}
		}],
		"ecss/content-block": [true, {
			"message": (selector) => {
				return printMessage("content-block", selector);
			}
		}],
		"ecss/class-numbered": [true, {
			"message": (selector) => {
				return printMessage("class-numbered", selector);
			}
		}],
		"ecss/not-class": [true, {
			"message": (selector) => {
				return printMessage("not-class", selector);
			}
		}],
		"ecss/selector-dimensions": [true, {
			"message": (selector) => {
				return printMessage("selector-dimensions", selector);
			}
		}],
		"ecss/relative-width": [true, {
			"message": (selector) => {
				return printMessage("relative-width", selector);
			}
		}],
		"ecss/flex-prop": [true, {
			"message": (selector) => {
				return printMessage("flex-prop", selector);
			}
		}],
		"ecss/flex-children": [true, {
			"message": (selector) => {
				return printMessage("flex-children", selector);
			}
		}],
		"ecss/technique-centered": [true, {
			"message": (selector) => {
				return printMessage("technique-centered", selector);
			}
		}],
		"ecss/padding-constraints": [true, {
			"message": (selector) => {
				return printMessage("padding-constraints", selector);
			}
		}],
		"ecss/component-outside": [true, {
			"message": (selector) => {
				return printMessage("component-outside", selector);
			}
		}],
		"ecss/spacing-large": [true, {
			"message": (selector) => {
				return printMessage("spacing-large", selector);
			}
		}],
		"ecss/position-prop": [true, {
			"message": (selector) => {
				return printMessage("position-prop", selector);
			}
		}],
		"ecss/pseudo-disallowed": [true, {
			"message": (selector) => {
				return printMessage("pseudo-disallowed", selector);
			}
		}],
		"ecss/tag-scoped-class": [true, {
			"message": (selector) => {
				return printMessage("tag-scoped-class", selector);
			}
		}],
		"ecss/content-float": [true, {
			"message": (selector) => {
				return printMessage("content-float", selector);
			}
		}],
		"ecss/component-dimensions": [true, {
			"message": (selector) => {
				return printMessage("component-dimensions", selector);
			}
		}],
		"ecss/content-margin": [true, {
			"message": (selector) => {
				return printMessage("content-margin", selector);
			}
		}],
		"ecss/class-combined-prefix": [true, {
			"message": (selector) => {
				return printMessage("class-combined-prefix", selector);
			}
		}],
		"ecss/content-padding": [true, {
			"message": (selector) => {
				return printMessage("content-padding", selector);
			}
		}],
		"ecss/class-child-prefix": [true, {
			"message": (selector) => {
				return printMessage("class-child-prefix", selector)}
		}],
		"ecss/selector-filename": [true, {
			"message": (selector, prop) => { 
				return printMessage("component-selector", selector, prop)},
			"ignoreFiles": ["quarantine.css", "main.css"]
		}],
		"ecss/commented-code": [true, {
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
		"ecss/ignored-properties": [true, {
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
