import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/technique-centered';
const messages = ruleMessages(ruleName, {
  expected: 'Outdated method of centered alignment. Use flex or grid.',
});

const meta = {
  url: 'https://example.com/rules/technique-centered'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    postcssRoot.walkDecls('transform', (decl) => {
      if (/translate\(-50%/.test(decl.value)) {
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
