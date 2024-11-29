
import { fileURLToPath } from 'node:url';
import stylelint from "stylelint";
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const config = {
	plugins: path.resolve(__dirname, "../plugins/ecss-component-dimensions.js"),
	rules: {
		"ecss/component-dimensions": true,
	},
};

describe("should pass", () => {
	it("should pass when CSS does not contain forbidden rules", async () => {
		const result = await stylelint.lint({
			files: path.resolve(__dirname, "fixtures/ecss-component-dimensions.pass.css"),
			config,
		});
		expect(result.errored).toBe(false);
	});
});

describe("should fail", () => {
	it("should fail when CSS contains forbidden rules", async () => {
		const result = await stylelint.lint({
			files: path.resolve(__dirname, "fixtures/ecss-component-dimensions.fail.css"),
			config,
		});
		expect(result.errored).toBe(true);
		expect(result.results[0].warnings).toHaveLength(4);
	});
});
