import test from 'ava';
import chalk from 'chalk';
import hasAnsi from 'has-ansi';
import Metalsmith from 'metalsmith';
import path from 'path';

import { processAsync } from './helpers/metalsmith';
import htmlValidator = require('../src/index');

const fixtures = path.join(__dirname, 'fixtures');

test('should colored validator details', async t => {
    let details = '';
    const metalsmith = Metalsmith(path.join(fixtures, 'invalid-single'))
        .source('src')
        .use(
            htmlValidator({
                logger(str) {
                    details = str;
                },
                chalk: new chalk.Instance({ level: 1 }),
            }),
        );

    await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.true(hasAnsi(details));
});

test('should not colored validator details', async t => {
    let details = '';
    const metalsmith = Metalsmith(path.join(fixtures, 'invalid-single'))
        .source('src')
        .use(
            htmlValidator({
                logger(str) {
                    details = str;
                },
                chalk: false,
            }),
        );

    await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.false(hasAnsi(details));
});
