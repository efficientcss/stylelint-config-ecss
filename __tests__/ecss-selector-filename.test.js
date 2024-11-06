import stylelint from "stylelint";

const config = {
  plugins: ["../plugins/ecss-selector-filename.js"],
  rules: {
    "plugin/ecss-selector-filename": true,
  },
};

describe("should pass", () => {
  it("should pass when CSS does not contain forbidden rules", async () => {
    const result = await stylelint.lint({
      files: "fixtures/ecss-selector-filename.pass.css",
      config,
    });
    expect(result.errored).toBe(false);
  });
});

describe("should fail", () => {
  it("should fail when CSS contains forbidden rules", async () => {
    const result = await stylelint.lint({
      files: "fixtures/ecss-selector-filename.fail.css",
      config,
    });
    expect(result.errored).toBe(true);
    expect(result.results[0].warnings).toHaveLength(4);
  });
});
