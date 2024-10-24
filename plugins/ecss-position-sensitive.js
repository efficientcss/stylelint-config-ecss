import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/position-sensitive';
const messages = ruleMessages(ruleName, {
  expected: 'This positioning value is tricky. Caution is required.',
});

const meta = {
  url: 'https://example.com/rules/position-sensitive'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    postcssRoot.walkDecls('position', (decl) => {
      if (/absolute|fixed/.test(decl.value)) {
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
