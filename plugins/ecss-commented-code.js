import stylelint from 'stylelint';

const ruleName = "ecss/commented-code";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: "Unexpected commented-out CSS code"
});

const ruleFunction = (primaryOption, secondaryOptions, context) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primaryOption,
      possible: [true, false]
    });

    if (!validOptions) {
      return;
    }


    // Regex to identify CSS properties within comments
    const commentedCssPattern = /[a-zA-Z-]+\s*:\s*[^;]+;\s*/;

    root.walkComments(comment => {
      if (comment.text.match(commentedCssPattern)) {
        stylelint.utils.report({
          message: messages.rejected,
          node: comment,
          result,
          ruleName
        });
      }
    });
  };
};

export default stylelint.createPlugin(ruleName, ruleFunction);
export { ruleName, messages };
