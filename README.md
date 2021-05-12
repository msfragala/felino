# Felino 🐈

Felino is a file name linter that brings consistency to file names in your codebase. Enforce naming conventions, forbid specific file names, or even validate files with your own custom logic!

## Installation

```sh
npm install felino --save-dev
# Or if using yarn
yarn add felino --dev
```

## Configuration

Felino requires a configuration file to know which files to lint and how to validate file names. Configuration files are loaded via [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), so there are several options for where you can put your config:

- `felino` key in `package.json`
- `.felinorc`
- `.felinorc.json`
- `.felinorc.yaml`
- `.felinorc.yml`
- `.felinorc.js`
- `.felinorc.cjs`
- `felino.config.js`
- `felino.config.cjs`

## Rules

Your configuration must define a `rules` property, an array of rule objects which support the following properties:

| Property | Type | Description | Required |
|---|---|---|---|
| `files`  | `string[]`| Array of globs (passed to [globby](https://github.com/sindresorhus/globby)) to specify which files should be linted.|Yes|
| `format` | `'kebab'` \| `'pascal'` \| `'snake'` \| `'constant'` \| `'camel'` \| `RegExp` \| `string` \| `function` | The format or naming pattern that files matched by `files` must adhere to. Files with nonconforming names trigger a failure.|No|
| `ignore` | `string[]`|An array of globs (passed to [globby](https://github.com/sindresorhus/globby)) to exclude files from linting. `node_modules` is always ignored automatically.| No|
| `forbid` | `string[]`| An array of wildcard patterns (passed to [matcher](https://github.com/sindresorhus/matcher)) to disallow naming patterns. Unlike `format`, `forbid` patterns match the entire file basename. Files whose names match a forbidden pattern trigger a failure. | No|

## Formats

The `format` property on rules dictates the naming pattern that files must conform to. Formats can be defined using either built-in casing patterns, regular expression literals, regular expression string, or custom functions.

### Common naming conventions

Felino supports several common naming conventions as format values:

- `kebab` — Ensures filenames follow kebab case, e.g. `example-file.js`
- `pascal` — Ensures filenames follow pascal case, e.g. `ExampleFile.js`
- `camel` — Ensures filenames follow camel case, e.g. `examleFile.js`
- `snake` — Ensures filenames follow snake case, e.g. `example_file.js`
- `constant` — Ensures filenames follow constant case, e.g. `EXAMPLE_FILE.js`

It's common for file names to include dot-separated specifiers, like `App.module.css` or `test.spec.js`. In this case, only the first part of the name is validated. So for example, if using `kebab` casing, a file named `cool-dog.spec.js` is considered valid.

```js
{
  // File named 'cool-dog.js' would pass ✅
  // File named 'cool-dog.spec.js' would pass ✅
  // File named 'CoolDog.js' would fail ❌
  format: 'kebab';
}
```

### Regex string

If `format` is a string but _not_ one of the naming conventions above, it's converted to a regex. Unlike with naming convention options, the _entire_ file basename (excluding extension) is validated.

```js
{
  // File named 'cool-dog.js' would pass ✅
  // File named 'cool-dog.spec.js' would fail ❌
  format: '^cool-dog$';
}
```

### Regex literal

You can also use a regex literal as the `format` value, which works the same as regex strings.

```js
{
  // File named 'cool-dog.js' would pass ✅
  // File named 'cool-dog.spec.js' would fail ❌
  format: /^cool-dog$/;
}
```

### Function

If you need even more control over validation logic, you can also use async functions to validate file names yourself. Functions receive two arguments: `name`, the name of the file (excluding extension) and `parsedPath`, the output from [`path.parse()`](https://nodejs.org/api/path.html#path_path_parse_path). If the function returns `true` then the file is considered valid; invalid if `false`.

```js
{
  // File named 'cool-dog.js' would pass ✅
  // File named 'index.js' would fail ❌
  // File named 'styles.css' would fail ❌
  format: async (name, parsedPath) => {
    const { ext } = parsedPath;
    if (ext === '.js' && name === 'index') return false;
    if (ext === '.css' && name === 'styles') return false;
    return true;
  };
}
```

_Function signature_
```ts
type ValidatorFn = (name: string, file: ParsedPath) => Promise<boolean>
```

### Example configuration

Here is an example configuration:

```js
module.exports = {
  rules: [
    {
      // Use kebab case for everything but components
      files: ['src/**/*'],
      format: 'kebab',
      ignore: ['src/components'],
    },
    {
      // Use pascal case for components
      files: ['src/components/**/*.js'],
      format: 'pascal',
      ignore: ['*.spec.js'],
      forbid: ['index.js'],
    },
    {
      // Disallow JavaScript files from being named just 'index.js'
      files: ['src/**/*.js'],
      forbid: ['index.js'],
    },
    {
      // Disallow collocated stylesheets from being named just 'styles.*'
      files: ['src/components/**/*.css'],
      forbid: ['styles.css', 'styles.module.css'],
    }
  ],
};
```
