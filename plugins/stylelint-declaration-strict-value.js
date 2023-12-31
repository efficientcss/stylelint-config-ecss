import stylelint from "stylelint"
import shortCSS from "shortcss"
import list from "shortcss/lib/list"
import cssValues from "css-values"

import {
  validProperties,
  validOptions,
  expectedTypes,
  customExpected,
  expected,
  getTypes,
  getIgnoredVariablesOrFunctions,
  getIgnoredKeywords,
  getIgnoredValues,
  getAutoFixFunc,
  failedToFix
} from "./lib/validation"
import defaults, { ruleName } from "./defaults"

const { utils } = stylelint
const messages = utils.ruleMessages(ruleName, {
  expected,
  customExpected,
  failedToFix
})
/**
 * RegExp to skip non-CSS properties.
 *
 * @internal
 */
const reSkipProp = /^(?:@|\$|--).+$/
/**
 * RegExp to parse CSS, SCSS and less variables.
 * - allowing CSS variables to be multi line
 * - Sass namespaces and CSS <ident-token> supported
 *
 * @internal
 * @see https://github.com/sass/sass/blob/master/accepted/module-system.md#member-references
 * @see  https://drafts.csswg.org/css-syntax-3/#ident-token-diagram
 */
// eslint-disable-next-line no-control-regex
const reVar = /^-?(?:@.+|(?:(?:[a-zA-Z_-]|[^\x20-\x7F])+(?:[a-zA-Z0-9_-]|[^\x20-\x7F])*\.)?\$.+|var\(\s*--[\s\S]+\))$/
/**
 * RegExp to parse functions.
 * - irgnoring CSS variables `var(--*)`
 * - allow multi line arguments
 *
 * @internal
 */
const reFunc = /^(?!var\(\s*--)[\s\S]+\([\s\S]*\)$/
/**
 * RegExp to parse regular expressions.
 * - supporting patterns
 * - and optional flags
 *
 * @internal
 */
const reRegex = /^\/(.*)\/([a-zA-Z]*)$/
/**
 * @internal
 */
const reColorProp = /color/
/**
 * Checks if string is a Regular Expression.
 *
 * @internal
 * @param value - Any string.
 */
const checkCssValue = (prop, value) =>
  (reColorProp.test(prop) && value === "transparent") ||
  reVar.test(value) ||
  reFunc.test(value) ||
  cssValues(prop, value)
const isRegexString = value => reRegex.test(value)
/**
 * Get pattern and flags of a Regular Expression string.
 *
 * @internal
 * @param value - Any string representing a Regular Expression.
 * @returns An Array of pattern and flags of a Regular Expression string.
 */
const getRegexString = value => value.match(reRegex).slice(1)
/**
 * Convert a Regular Expression string to an RegExp object.
 *
 * @internal
 * @param value - Any string representing a Regular Expression.
 * @returns A Regular Expression object.
 */
const stringToRegex = value => {
  const [pattern, flags] = getRegexString(value)
  return new RegExp(pattern, flags)
}
/**
 * Map ignored value config to a Regular expression.
 *
 * @internal
 * @param ignoreValue - A ignored value property.
 * @returns A Regular Expression to match ignored values.
 */
const mapIgnoreValue = ignoreValue =>
  isRegexString(`${ignoreValue}`)
    ? stringToRegex(`${ignoreValue}`)
    : new RegExp(`^${ignoreValue}$`)

const ruleFunction = (properties, options, context = {}) => (root, result) => {
  // fix #142
  // @see https://github.com/stylelint/stylelint/pull/672/files#diff-78f1c80ffb2836008dd194b3b0ca28f9b46e4897b606f0b3d25a29e57a8d3e61R74
  // @see https://stylelint.io/user-guide/configure#message
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (
    result &&
    result.stylelint &&
    result.stylelint.customMessages &&
    result.stylelint.customMessages[ruleName]
  ) {
    // eslint-disable-next-line no-param-reassign
    delete result.stylelint.customMessages[ruleName]
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // validate stylelint plugin options
  const hasValidOptions = utils.validateOptions(
    result,
    ruleName,
    {
      actual: properties,
      possible: validProperties
    },
    {
      actual: options,
      possible: validOptions,
      optional: true
    }
  )

  if (!hasValidOptions) return

  // normalize options
  if (!Array.isArray(properties)) {
    // eslint-disable-next-line no-param-reassign
    properties = [properties]
  }

  const config = {
    ...defaults,
    ...options
  }
  const {
    ignoreVariables,
    ignoreFunctions,
    ignoreKeywords,
    ignoreValues,
    message,
    disableFix,
    autoFixFunc,
    expandShorthand,
    recurseLonghand
  } = config
  const autoFixFuncNormalized = getAutoFixFunc(
    autoFixFunc,
    disableFix,
    context.fix
  )
  const reKeywords = ignoreKeywords ? {} : null
  const reValues = ignoreValues ? {} : null
  let cssLoaderValues

  if (ignoreVariables) {
    const cssLoaderValuesNames = []
    root.walkAtRules("value", rule => {
      const { params } = rule
      const name = params.split(":")[0].trim()

      cssLoaderValuesNames.push(name)
    })

    cssLoaderValues = new RegExp(`^-?(:?${cssLoaderValuesNames.join("|")})$`)
  }

  // loop through all properties
  properties.forEach(property => {
    let propFilter = property

    // parse RegExp
    if (isRegexString(propFilter)) {
      propFilter = stringToRegex(propFilter)
    }

    // walk through all declarations filtered by configured properties
    root.walkDecls(filterDecl)

    /**
     * Filter declarations for matching properties and expand shorthand properties.
     *
     * @internal
     * @param node - A Declaration-Node from PostCSS AST-Parser.
     */
    function filterDecl(node) {
      const { value, prop } = node

      // skip variable declarations
      if (reSkipProp.test(prop)) return

      const isShortHand = expandShorthand && shortCSS.isShorthand(prop)

      if (
        prop === propFilter ||
        (!isShortHand && propFilter instanceof RegExp && propFilter.test(prop))
      ) {
        const values = list.space(value)

        // handle multi-value props, like scrollbar-color
        if (values.length > 1) {
          let failedFlag = false

          values.forEach(valueItem => {
            if (!failedFlag) {
              failedFlag = lintDeclStrictValue(node, prop, valueItem)
            }
          })
        } else {
          lintDeclStrictValue(node)
        }
      } else if (isShortHand) {
        const expandedProps = shortCSS.expand(prop, value, recurseLonghand)
        let failedFlag = false

        Object.keys(expandedProps).forEach(longhandProp => {
          const longhandValue = expandedProps[longhandProp]

          if (
            !failedFlag &&
            (longhandProp === propFilter ||
              (propFilter instanceof RegExp && propFilter.test(longhandProp)))
          ) {
            failedFlag = lintDeclStrictValue(
              node,
              longhandProp,
              longhandValue,
              true
            )
          }
        })
      }
    }

    /**
     * Lint usages of declarations values against, variables, functions
     * or custom keywords - as configured.
     *
     * @internal
     * @param node - A Declaration-Node from PostCSS AST-Parser.
     * @param longhandProp - A Declaration-Node from PostCSS AST-Parser.
     * @param longhandValue - A Declaration-Node from PostCSS AST-Parser.
     * @param isExpanded - Whether or not this declaration was expanded.
     * @returns Returns `true` if invalid declaration found, else `false`.
     */
    function lintDeclStrictValue(
      node,
      longhandProp,
      longhandValue,
      isExpanded = false
    ) {
      const { value: nodeValue, prop: nodeProp } = node
      const value = longhandValue || nodeValue

      // falsify everything by default
      let validVar = false
      let validFunc = false
      let validKeyword = false
      let validValue = false

      // test variable
      if (ignoreVariables) {
        // @TODO: deviant regexes to primary options need to be evaluated
        const ignoreVariable = getIgnoredVariablesOrFunctions(
          ignoreVariables,
          property
        )

        if (ignoreVariable) {
          validVar = reVar.test(value) || cssLoaderValues.test(value)
        }
      }

      // test function
      if (ignoreFunctions && !validVar) {
        // @TODO: deviant regexes to primary options need to be evaluated
        const ignoreFunction = getIgnoredVariablesOrFunctions(
          ignoreFunctions,
          property
        )

        if (ignoreFunction) {
          validFunc = reFunc.test(value)
        }
      }

      // test expanded shorthands are valid
      if (
        isExpanded &&
        (!ignoreVariables || (ignoreVariables && !validVar)) &&
        (!ignoreFunctions || (ignoreFunctions && !validFunc)) &&
        checkCssValue(longhandProp, longhandValue) !== true
      ) {
        return false
      }

      // test keywords
      if (ignoreKeywords && (!validVar || !validFunc)) {
        let reKeyword = reKeywords[property]

        if (!reKeyword) {
          const ignoreKeyword = getIgnoredKeywords(ignoreKeywords, property)

          if (ignoreKeyword) {
            reKeyword = new RegExp(`^${ignoreKeyword.join("$|^")}$`)
            reKeywords[property] = reKeyword
          }
        }

        if (reKeyword) {
          validKeyword = reKeyword.test(value)
        }
      }

      if (ignoreValues && (!validVar || !validFunc || !validKeyword)) {
        let reValueList = reValues[property]

        if (!reValueList) {
          const ignoreValue = getIgnoredValues(ignoreValues, property)

          if (ignoreValue) {
            reValueList = ignoreValue.map(mapIgnoreValue)
            reValues[property] = reValueList
          }
        }

        if (reValueList) {
          validValue =
            reValueList.filter(reValue => reValue.test(value)).length > 0
        }
      }

      // report only if all failed
      if (!validVar && !validFunc && !validKeyword && !validValue) {
        const types = getTypes(config, property)

        // support auto fixing
        if (context.fix && !disableFix && autoFixFuncNormalized) {
          try {
            const fixedValue = autoFixFuncNormalized(
              node,
              {
                validVar,
                validFunc,
                validKeyword,
                validValue,
                longhandProp,
                longhandValue
              },
              root,
              config
            )

            // apply fixed value if returned
            if (fixedValue) {
              // eslint-disable-next-line no-param-reassign
              node.value = fixedValue
            }
          } catch (error) {
            const { raws } = node
            // eslint-disable-next-line prefer-destructuring
            const start = node.source.start

            utils.report({
              ruleName,
              result,
              node,
              line: start.line,
              column: start.column + nodeProp.length + raws.between.length,
              message: messages.failedToFix(error, value, nodeProp)
            })
          }
        } else {
          const { raws } = node
          // eslint-disable-next-line prefer-destructuring
          const start = node.source.start

          utils.report({
            ruleName,
            result,
            node,
            line: start.line,
            column: start.column + nodeProp.length + raws.between.length,

            message: message
              ? messages.customExpected(
                  expectedTypes(types),
                  value,
                  nodeProp,
                  message
                )
              : messages.expected(expectedTypes(types), value, nodeProp)
          })
        }

        return true
      }

      return false
    }
  })
}

ruleFunction.primaryOptionArray = true
ruleFunction.ruleName = ruleName
ruleFunction.messages = messages

const declarationStrictValuePlugin = stylelint.createPlugin(
  ruleName,
  ruleFunction
)

export default declarationStrictValuePlugin
export { ruleName, messages }

