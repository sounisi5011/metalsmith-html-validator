import test from 'ava';
import cloneDeep from 'lodash.clonedeep';
import Metalsmith from 'metalsmith';
import path from 'path';

import { ignoreTypeError } from './helpers';
import { processAsync } from './helpers/metalsmith';
import htmlValidator = require('../src/index');

const fixtures = path.join(__dirname, 'fixtures');

test('defaultOptions cannot be changed', async t => {
    const metalsmith = Metalsmith(path.join(fixtures, 'valid'))
        .source('src')
        .use(
            htmlValidator(async (_files, _metalsmith, defaultOptions) => {
                const originalOptions = cloneDeep(defaultOptions);

                ignoreTypeError(() => {
                    Object.assign(defaultOptions, { hoge: 'fuga' });
                });
                t.deepEqual(
                    defaultOptions,
                    originalOptions,
                    'Properties cannot be added',
                );

                ignoreTypeError(() => {
                    Object.assign(defaultOptions, { pattern: '**/.meta' });
                });
                t.deepEqual(
                    defaultOptions,
                    originalOptions,
                    'Properties cannot be changed',
                );

                ignoreTypeError(() => {
                    if (Array.isArray(defaultOptions.pattern)) {
                        defaultOptions.pattern.push('**');
                    }
                });
                t.deepEqual(
                    defaultOptions,
                    originalOptions,
                    'Child properties cannot be changed',
                );

                return {
                    // disable display to stderr
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    logger() {},
                };
            }),
        );
    await processAsync(metalsmith);
});
