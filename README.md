# Stylelint Config for ECSS

> Linting rules for writing Efficient CSS.

**ECSS sets simple rules for simple styling.** No more naming everything, no more technological dependencies. Only intentional, consistent, simple, expressive, predictable, sustainable CSS.

For the complete documentation, see [ecss.info](https://ecss.info).

## Installation

```bash
npm install @efficientcss/stylelint-config-ecss
```

## Usage

Add this package to the `extend`{.json} array in your Stylelint configuration or copy the following code in a new `.stylelintrc.json` file.

```json
{
	"extends": ["@efficientcss/stylelint-config-ecss"]
}
```

You can override and/or disable ECSS rules by using the Stylelint `overrides` array.

```json
{
	"extends": ["@efficientcss/stylelint-config-ecss"]
	"overrides": [
		{
			"files": ["*"],
			"rules": {
				"declaration-empty-line-before": null,
				"order/properties-order": null
			}
		}
	]
}
```

For further usage instructions, please refer to the [Stylelint official documentation](https://stylelint.io).
