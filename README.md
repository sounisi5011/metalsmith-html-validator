# metalsmith-html-validator

[![Go to the latest release page on npm](https://img.shields.io/npm/v/metalsmith-html-validator.svg)][npm]
[![License: MIT](https://img.shields.io/static/v1?label=license&message=MIT&color=green)][github-license]
![Supported Node.js version: >=8.3.0](https://img.shields.io/static/v1?label=node&message=%3E%3D8.3.0&color=brightgreen)
![Type Definitions: TypeScript](https://img.shields.io/static/v1?label=types&message=TypeScript&color=blue)
[![bundle size](https://img.shields.io/bundlephobia/min/metalsmith-html-validator/1.1.1)](https://bundlephobia.com/result?p=metalsmith-html-validator@1.1.1)
[![Dependencies Status](https://david-dm.org/sounisi5011/metalsmith-html-validator/status.svg)](https://david-dm.org/sounisi5011/metalsmith-html-validator)
[![Build Status](https://dev.azure.com/sounisi5011/npm%20projects/_apis/build/status/sounisi5011.metalsmith-html-validator?branchName=master)](https://dev.azure.com/sounisi5011/npm%20projects/_build/latest?definitionId=3&branchName=master)
[![Maintainability Status](https://api.codeclimate.com/v1/badges/3fdd1f208cb3fb05faac/maintainability)](https://codeclimate.com/github/sounisi5011/metalsmith-html-validator/maintainability)

[npm]: https://www.npmjs.com/package/metalsmith-html-validator
[github-license]: https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/LICENSE

[Metalsmith] plugin for HTML validation, using the [Nu Html Checker (v.Nu)].

[Metalsmith]: https://github.com/segmentio/metalsmith
[Nu Html Checker (v.Nu)]: https://validator.github.io/validator/

## Requirements

This plugin **requires Java 8 or above**.
If the `java` command does not exist on the system running this plugin, Java 8+ must be installed.

## Install

```sh
npm install metalsmith-html-validator
```

## CLI Usage

Install via npm and then add the `metalsmith-html-validator` key to your `metalsmith.json` plugin, like so:

```json
{
  "plugins": {
    "metalsmith-html-validator": true
  }
}
```

If you need to specify an options, set the options to the value of the `metalsmith-html-validator` key.

```json
{
  "plugins": {
    "metalsmith-html-validator": {
      "pattern": "**/*.html"
    }
  }
}
```

See [Metalsmith CLI] for more details.

[Metalsmith CLI]: https://github.com/segmentio/metalsmith#cli

## Javascript Usage

The simplest use is to omit the option.

```js
const htmlValidator = require('metalsmith-html-validator');

metalsmith
  .use(htmlValidator());
```

If you need to specify an options, set the options value.

```js
const htmlValidator = require('metalsmith-html-validator');

metalsmith
  .use(htmlValidator({
    pattern: '**/*.html',
  }));
```

If you want to use the `files` variable or the default options value, you can specify the callback function that generates the options.

```js
const htmlValidator = require('metalsmith-html-validator');

metalsmith
  .use(htmlValidator(
    (files, metalsmith, defaultOptions) => {
      return {
        pattern: [...defaultOptions.pattern, '!**/_*', '!**/_*/**'],
      };
    }
  ));
```

## TypeScript Usage

For compatibility with the [Metalsmith CLI], this package exports single function in CommonJS style.  
When using with TypeScript, it is better to use the [`import = require()` statement](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

```js
import htmlValidator = require('metalsmith-html-validator');

metalsmith
  .use(htmlValidator());
```

## Options

The default value for options are [defined](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L20-L26) like this:

```js
const chalk = require('chalk'); // chalk@3.0.0

{
  pattern: ['**/*.{html,htm}'],
  logger: console.error,
  chalk: chalk.stderr,
}
```

### `pattern`

Specifies the Glob pattern that matches the file to be validated.  
Specify a glob expression string or an array of strings as the pattern.  
Pattern are verified using [multimatch v4.0.0][npm-multimatch-used].

[npm-multimatch-used]: https://www.npmjs.com/package/multimatch/v/4.0.0

Default value ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L22)):

```js
['**/*.{html,htm}']
```

Type definition ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L7)):

```ts
string | string[]
```

### `logger`

Specify a logger function to process the validator result.

Default value ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L23)):

```js
console.error
```

Type definition ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L8)):

```ts
(str: string) => void
```

### `chalk`

Specifies the [chalk][npm-chalk-used] instance that colors the validator result.  
When `false` or `null` is specified, coloring is disabled.

[npm-chalk-used]: https://www.npmjs.com/package/chalk/v/3.0.0

Default value ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L25)):

```js
const chalk = require('chalk'); // chalk@3.0.0

chalk.stderr
```

Type definition ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.1.1/src/options.ts#L9)):

```ts
// import chalk = require('chalk'); // chalk@3.0.0

chalk.Chalk | false | null
```

## Debug mode

This plugin supports debugging output.  
To enable, use the following command when running your build script:

```sh
DEBUG=metalsmith-html-validator,metalsmith-html-validator:* node my-website-build.js
```

For more details, please check the description of [debug v4.1.1][npm-debug-used].

[npm-debug-used]: https://www.npmjs.com/package/debug/v/4.1.1

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```sh
npm install
npm test
```

## Contributing

see [CONTRIBUTING.md](https://github.com/sounisi5011/metalsmith-html-validator/blob/master/CONTRIBUTING.md)

## Related

* [metalsmith-formatcheck](https://github.com/gchallen/code.metalsmith-formatcheck)
