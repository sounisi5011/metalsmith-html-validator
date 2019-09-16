# metalsmith-html-validator

[![npm package](https://img.shields.io/npm/v/metalsmith-html-validator.svg)][npm]
[![License: MIT](https://img.shields.io/static/v1?label=license&message=MIT&color=green)][github-license]
![Supported Node version: >=8.3.0](https://img.shields.io/static/v1?label=node&message=%3E%3D8.3.0&color=brightgreen)
![Type Definitions: TypeScript](https://img.shields.io/npm/types/metalsmith-html-validator.svg)
[![bundle size](https://badgen.net/bundlephobia/min/metalsmith-html-validator@1.0.0)](https://bundlephobia.com/result?p=metalsmith-html-validator@1.0.0)
[![Dependencies Status](https://david-dm.org/sounisi5011/metalsmith-html-validator/status.svg)](https://david-dm.org/sounisi5011/metalsmith-html-validator)
[![Build Status](https://travis-ci.com/sounisi5011/metalsmith-html-validator.svg?branch=master)](https://travis-ci.com/sounisi5011/metalsmith-html-validator)
[![Maintainability Status](https://api.codeclimate.com/v1/badges/3fdd1f208cb3fb05faac/maintainability)](https://codeclimate.com/github/sounisi5011/metalsmith-html-validator/maintainability)

[npm]: https://www.npmjs.com/package/metalsmith-html-validator
[github-license]: https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.0.0/LICENSE

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

The default value for options are [defined](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.0.0/src/options.ts#L16-L18) like this:

```js
{
  pattern: ['**/*.{html,htm}'],
}
```

### `pattern`

Specifies the Glob pattern that matches the file to be validated.  
Specify a glob expression string or an array of strings as the pattern.  
Pattern are verified using [multimatch v4.0.0][npm-multimatch-used].

[npm-multimatch-used]: https://www.npmjs.com/package/multimatch/v/4.0.0

Default value ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.0.0/src/options.ts#L17)):

```js
['**/*.{html,htm}']
```

Type definition ([source](https://github.com/sounisi5011/metalsmith-html-validator/blob/v1.0.0/src/options.ts#L5)):

```ts
string | string[]
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
