import test from 'ava';
import Metalsmith from 'metalsmith';
import path from 'path';

import { processAsync } from './helpers/metalsmith';
import htmlValidator = require('../src/index');

const fixtures = path.join(__dirname, 'fixtures');

test('should not throw error by valid html files', async t => {
    const metalsmith = Metalsmith(path.join(fixtures, 'valid'))
        .source('src')
        .use(
            htmlValidator({
                // disable display to stderr
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                logger() {},
            }),
        );

    await t.notThrowsAsync(async () => {
        await processAsync(metalsmith);
    });
});

test('should not throw error by valid single html file', async t => {
    const metalsmith = Metalsmith(path.join(fixtures, 'valid-single'))
        .source('src')
        .use(
            htmlValidator({
                // disable display to stderr
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                logger() {},
            }),
        );

    await t.notThrowsAsync(async () => {
        await processAsync(metalsmith);
    });
});

test('should throw error by invalid html files', async t => {
    let details = '';
    const metalsmith = Metalsmith(path.join(fixtures, 'invalid'))
        .source('src')
        .use(
            htmlValidator({
                logger(str) {
                    details = str;
                },
            }),
        );

    const error = await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.regex(
        details,
        /^frameset\.html:$/m,
        `The logger()'s argument should have an invalid HTML filenames`,
    );
    t.regex(
        details,
        /^non-utf8\.html:$/m,
        `The logger()'s argument should have an invalid HTML filenames`,
    );

    t.notRegex(
        error.message,
        /^frameset\.html:$/m,
        `The error object's "message" property should not have an invalid HTML filenames`,
    );
    t.notRegex(
        error.message,
        /^non-utf8\.html:$/m,
        `The error object's "message" property should not have an invalid HTML filenames`,
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

test('should throw error by invalid single html file', async t => {
    let details = '';
    const metalsmith = Metalsmith(path.join(fixtures, 'invalid-single'))
        .source('src')
        .use(
            htmlValidator({
                logger(str) {
                    details = str;
                },
            }),
        );

    const error = await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.regex(
        details,
        /^empty-title\.html:$/m,
        `The logger()'s argument should have an invalid HTML filenames`,
    );

    t.notRegex(
        error.message,
        /^empty-title\.html:$/m,
        `The error object's "message" property should not have an invalid HTML filename`,
    );

    if (error.stack) {
        t.notRegex(
            error.stack,
            /^empty-title\.html:$/m,
            `The error object's "stack" property should not have an invalid HTML filename`,
        );
    }
});
