import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/position-prop';
const messages = ruleMessages(ruleName, {
  expected: 'Non-static position expected for positioning properties in a self-combined context without child selectors.',
});

const meta = {
  url: 'https://example.com/rules/position-prop'
};

const ruleFunction = (primaryOption, secondaryOption, context) => {
  return (postcssRoot, postcssResult) => {
    postcssRoot.walkRules((rule) => {
      // Determine if the current rule is self-combined but not a child selector
      const isSelfCombined = /&/.test(rule.selector);
      const isChildSelector = /&\s*>/.test(rule.selector);

      // Only proceed if the rule is self-combined and not a child selector
      if (!isSelfCombined || isChildSelector) {
        return;
      }

      let hasNonStaticPosition = false;

      // Check if the rule itself has a "position" declaration that is not "static"
      rule.walkDecls('position', (decl) => {
        if (!/static/.test(decl.value)) {
          hasNonStaticPosition = true;
        }
      });

      // If no non-static position is present, check for the use of positioning properties
      if (!hasNonStaticPosition) {
        rule.walkDecls(/^(top|right|bottom|left)$/, (decl) => {
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
