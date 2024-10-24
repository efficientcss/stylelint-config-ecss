import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/not-class';
const messages = ruleMessages(ruleName, {
  expected: 'Do not use entities in the :not() selector.',
});

const meta = {
  url: 'https://example.com/rules/not-class'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    const notWithClassesRegex = /:not\(.*\./;

    postcssRoot.walkRules((rule) => {
      if (notWithClassesRegex.test(rule.selector)) {
        report({
          message: messages.expected,
          node: rule,
          result: postcssResult,
          ruleName,
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
