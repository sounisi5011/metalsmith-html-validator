import test from 'ava';
import Metalsmith from 'metalsmith';
import path from 'path';

import { processAsync } from './helpers/metalsmith';
import htmlValidator = require('../src/index');

const fixtures = path.join(__dirname, 'fixtures');

test('should not throw error by valid html', async t => {
    const metalsmith = Metalsmith(path.join(fixtures, 'valid'))
        .source('src')
        .use(htmlValidator());

    await t.notThrowsAsync(async () => {
        await processAsync(metalsmith);
    });
});

test('should throw error by invalid html', async t => {
    const metalsmith = Metalsmith(path.join(fixtures, 'invalid'))
        .source('src')
        .use(htmlValidator());

    const error = await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.regex(
        error.message,
        /^frameset\.html:$/m,
        `The error object's "message" property should have an invalid HTML filenames`,
    );
    t.regex(
        error.message,
        /^non-utf8\.html:$/m,
        `The error object's "message" property should have an invalid HTML filenames`,
    );

    if (error.stack) {
        t.notRegex(
            error.stack,
            /^frameset\.html:$/m,
            `The error object's "stack" property should not have an invalid HTML filenames`,
        );
        t.notRegex(
            error.stack,
            /^non-utf8\.html:$/m,
            `The error object's "stack" property should not have an invalid HTML filenames`,
        );
    }
});
