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
    const cwd = path.join(fixtures, 'valid');

    /**
     * On Windows, modules cannot be import from symbolic links to the node_modules directory committed to Git.
     * Regenerating the symbolic link with the "npm install" command can solve this problem.
     */
    await t.notThrowsAsync(exec('npm', ['install', PROJECT_ROOT], { cwd }));

    await t.notThrowsAsync(
        exec(metalsmithCLI, [], {
            cwd,
        }),
    );
});

test('should not work with Metalsmith CLI', async t => {
    const cwd = path.join(fixtures, 'invalid');

    /**
     * On Windows, modules cannot be import from symbolic links to the node_modules directory committed to Git.
     * Regenerating the symbolic link with the "npm install" command can solve this problem.
     */
    await t.notThrowsAsync(exec('npm', ['install', PROJECT_ROOT], { cwd }));

    const error = await t.throwsAsync(
        exec(metalsmithCLI, [], {
            cwd,
        }),
    );

    t.regex(error.message, /^e frameset\.html:$/m);
    t.regex(error.message, /^e non-utf8\.html:$/m);
});
