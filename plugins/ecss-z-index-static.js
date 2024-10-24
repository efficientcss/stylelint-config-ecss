import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages }
} = stylelint;

const ruleName = 'ecss/z-index-static';
const messages = ruleMessages(ruleName, {
  expected: 'Non-static position expected when using "z-index".',
});

const meta = {
  url: 'https://example.com/rules/z-index-static'
};

const ruleFunction = () => {
  return (postcssRoot, postcssResult) => {
    postcssRoot.walkRules((rule) => {
      // Détecter les types de sélecteurs
      const isDescendant = /&\s+\./.test(rule.selector);
      const isCombined = /&\./.test(rule.selector);

      // Fonction pour vérifier la présence d'une position non statique
      const hasNonStaticPosition = (rule) => {
        let currentRule = rule;
        while (currentRule && currentRule.type === 'rule') {
          if (currentRule.some((decl) => decl.prop === 'position' && !/static/.test(decl.value))) {
            return true;
          }
          currentRule = currentRule.parent;
        }
        return false;
      };

      // Vérifier la présence de "z-index" et l'absence de position non statique
      rule.walkDecls('z-index', (decl) => {
        const hasPositionInRule = rule.some(
          (decl) => decl.prop === 'position' && !/static/.test(decl.value)
        );

        // Condition pour signaler une erreur
        if (
          (isDescendant && !hasPositionInRule) ||
          (isCombined && !hasNonStaticPosition(rule))
        ) {
          report({
            message: messages.expected,
            node: decl,
            result: postcssResult,
            ruleName,
          });
        }
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
