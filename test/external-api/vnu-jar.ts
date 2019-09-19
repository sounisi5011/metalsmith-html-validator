import Ajv from 'ajv';
import test from 'ava';
import Metalsmith from 'metalsmith';
import path from 'path';

import schema from '../../src/schemas/vnu-jar.json';
import { isFile } from '../../src/utils/metalsmith';
import { validateContent, validateFiles } from '../../src/validator';
import { childdirList } from '../helpers';
import { readAsync } from '../helpers/metalsmith';

const fixtures = path.join(__dirname, '..', 'fixtures');
const ajv = new Ajv();
const validate = ajv.compile(schema);

test('The JSON output by vnu.jar should be in the expected format', async t => {
    const queue: (() => Promise<void>)[] = [];
    const queuedBufSet: Buffer[] = [];

    await Promise.all(
        (await childdirList(fixtures))
            .filter(dirname => dirname !== 'node_modules')
            .map(async dirname => {
                const metalsmith = Metalsmith(path.join(fixtures, dirname));
                const files = await readAsync(metalsmith);

                queue.push(async () => {
                    const { data } = await validateFiles(files);
                    if (validate(data)) {
                        t.pass(`fixtures/${dirname}/ files`);
                    } else {
                        t.fail(`fixtures/${dirname}/ files`);
                        t.log(data, validate.errors);
                    }
                });

                for (const [filename, filedata] of Object.entries(files)) {
                    if (!isFile(filedata)) {
                        continue;
                    }

                    const { contents } = filedata;
                    if (queuedBufSet.some(buf => buf.equals(contents))) {
                        continue;
                    }

                    queuedBufSet.push(contents);
                    queue.push(async () => {
                        const { data } = await validateContent(contents);
                        if (validate(data)) {
                            t.pass(`fixtures/${dirname}/src/${filename} file`);
                        } else {
                            t.fail(`fixtures/${dirname}/src/${filename} file`);
                            t.log(data, validate.errors);
                        }
                    });
                }
            }),
    );

    const parallels = 6;
    while (queue.length > 0) {
        await Promise.all(queue.splice(0, parallels).map(func => func()));
    }
});
