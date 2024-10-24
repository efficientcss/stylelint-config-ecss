import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/overflow-hidden';
const messages = ruleMessages(ruleName, {
  expected: 'Expected "border-radius" or "aspect-ratio" when using "overflow: hidden".',
});

const meta = {
  url: 'https://example.com/rules/overflow-hidden'
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

      let hasRequiredProperties = false;

      // Check if the rule has "border-radius" or "aspect-ratio" declarations
      rule.walkDecls(/^(border-radius|aspect-ratio)$/, () => {
        hasRequiredProperties = true;
      });

      // If no required properties are present, check for "overflow: hidden"
      if (!hasRequiredProperties) {
        rule.walkDecls('overflow', (decl) => {
          if (decl.value === 'hidden') {
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
