import test from 'ava';
import Metalsmith from 'metalsmith';
import path from 'path';

import { processAsync } from './helpers/metalsmith';
import htmlValidator = require('../src/index');

const fixtures = path.join(__dirname, 'fixtures');

test('should empty validator details', async t => {
    let details: string | null = null;
    const metalsmith = Metalsmith(path.join(fixtures, 'valid-no-warn'))
        .source('src')
        .use(
            htmlValidator({
                logger(str) {
                    details = str;
                },
            }),
        );

    await t.notThrowsAsync(async () => {
        await processAsync(metalsmith);
    });

    t.is(details, '');
});
