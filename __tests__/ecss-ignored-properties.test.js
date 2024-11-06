import stylelint from "stylelint";

const config = {
  plugins: ["../plugins/ecss-ignored-properties.js"],
  rules: {
    "plugin/ecss-ignored-properties": true,
  },
};

describe("should pass", () => {
  it("should pass when CSS does not contain forbidden rules", async () => {
    const result = await stylelint.lint({
      files: "fixtures/ecss-ignored-properties.pass.css",
      config,
    });
    expect(result.errored).toBe(false);
  });
});

describe("should fail", () => {
  it("should fail when CSS contains forbidden rules", async () => {
    const result = await stylelint.lint({
      files: "fixtures/ecss-ignored-properties.fail.css",
      config,
    });
    expect(result.errored).toBe(true);
    expect(result.results[0].warnings).toHaveLength(1);
  });
});
