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

    await t.throwsAsync(async () => {
        await processAsync(metalsmith);
    });
});
