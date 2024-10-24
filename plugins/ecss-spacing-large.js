import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/spacing-large';
const messages = ruleMessages(ruleName, {
  expected: 'Very large spacing. May indicate a composition problem.',
});

const meta = {
  url: 'https://example.com/rules/spacing-large'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    postcssRoot.walkDecls(/^(margin|padding)$/, (decl) => {
      if (/^-?(\d{2,}(em|rem)|\d{3,}px)/.test(decl.value)) {
        report({
          message: messages.expected,
          node: decl,
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
