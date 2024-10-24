import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/padding-constraints';
const messages = ruleMessages(ruleName, {
  expected: 'Paddings should first be uniform and require graphical constraints.',
});

const meta = {
  url: 'https://example.com/rules/padding-constraints'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    const ignoreSelectorsRegex = /(>|\s)?(a|ul|ol|button|input)(:.*)?$/;

    postcssRoot.walkRules((rule) => {
      if (!ignoreSelectorsRegex.test(rule.selector)) {
        rule.walkDecls(/^padding(-.*)?$/, (decl) => {
          const hasConstraint = rule.nodes.some((node) =>
            /^(text-indent|padding|background|border|margin|box-sizing|overflow)$/.test(node.prop)
          );

          if (!hasConstraint) {
            report({
              message: messages.expected,
              node: decl,
              result: postcssResult,
              ruleName,
            });
          }
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
