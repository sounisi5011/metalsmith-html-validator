import test from 'ava';
import path from 'path';

import exec from './helpers/exec';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const fixtures = path.join(__dirname, 'fixtures');
const metalsmithCLI = path.resolve(
    PROJECT_ROOT,
    'node_modules',
    '.bin',
    'metalsmith',
);

test.before(async () => {
    await exec('npm', ['run', 'build'], {
        cwd: PROJECT_ROOT,
    });
});

test('should work with Metalsmith CLI', async t => {
    await t.notThrowsAsync(
        exec(metalsmithCLI, [], {
            cwd: path.join(fixtures, 'cli-valid'),
        }),
    );
});

test('should not work with Metalsmith CLI', async t => {
    const error = await t.throwsAsync(
        exec(metalsmithCLI, [], {
            cwd: path.join(fixtures, 'cli-invalid'),
        }),
    );

    t.regex(error.message, /^e frameset\.html:$/m);
    t.regex(error.message, /^e non-utf8\.html:$/m);
});
