import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/component-outside';
const messages = ruleMessages(ruleName, {
  expected: 'A component should not influence its external context. Its parent container takes care of the rhythm.',
});

const meta = {
  url: 'https://example.com/rules/component-outside'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    const componentSelectorsRegex = /^(?!& )(?!.*__)([.]|\\[[a-z0-9-_]*="?)(?!.*(?:image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea))[a-zA-Z0-9-_]+("?\\])?$/;

    postcssRoot.walkRules((rule) => {
      if (componentSelectorsRegex.test(rule.selector)) {
        rule.walkDecls('margin', (decl) => {
          report({
            message: messages.expected,
            node: decl,
            result: postcssResult,
            ruleName,
          });
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
