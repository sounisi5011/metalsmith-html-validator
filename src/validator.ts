import createDebug from 'debug';
import path from 'path';
import onExit from 'signal-exit';
import vnuJar from 'vnu-jar';

import { VNuJSONSchema, VNuMessageObject } from './schemas/vnu-jar';
import {
    exec,
    promiseFinally,
    removeForceAsync,
    removeForceSync,
    tmpDirAsync,
} from './utils';
import { FileInterface, writeFilesAsync } from './utils/metalsmith';

const debug = createDebug(require('../package.json').name).extend('validator');

export async function validateContent(
    content: string | Buffer,
    options: ReadonlyArray<string> = [],
    javaOptions: ReadonlyArray<string> = [],
): Promise<{
    data: VNuJSONSchema;
    filenameMap: WeakMap<VNuMessageObject, string>;
}> {
    const result = await exec(
        'java',
        [...javaOptions, '-jar', vnuJar, ...options, '--format', 'json', '-'],
        { input: content },
    );
    const data: VNuJSONSchema = JSON.parse(result.stderr.toString());
    return { data, filenameMap: new WeakMap() };
}

export async function validateFiles(
    files: Record<string, FileInterface>,
    options: ReadonlyArray<string> = [],
    javaOptions: ReadonlyArray<string> = [],
): Promise<{
    data: VNuJSONSchema;
    filenameMap: WeakMap<VNuMessageObject, string>;
}> {
    const tmpDir = await tmpDirAsync({ prefix: `metalsmith-html-validator-` });
    const removeExitListener = onExit(() => {
        try {
            debug('deleting a temporary directory by Signal Event: %o', tmpDir);
            removeForceSync(tmpDir);
        } catch (error) {
            console.error(error);
        }
    });
    debug('created a temporary directory: %o', tmpDir);

    debug('writing files to temporary directory: %o', tmpDir);
    await writeFilesAsync(files, tmpDir);

    const result = await promiseFinally(
        exec('java', [
            ...javaOptions,
            '-jar',
            vnuJar,
            ...options,
            '--format',
            'json',
            tmpDir,
        ]),
        async () => {
            debug('deleting a temporary directory: %o', tmpDir);
            await removeForceAsync(tmpDir);
            removeExitListener();
        },
    );

    const data: VNuJSONSchema = JSON.parse(result.stderr.toString());

    const filenameMap = new WeakMap<VNuMessageObject, string>();
    data.messages.forEach(message => {
        const { url } = message;
        if (url) {
            if (/^file:/.test(url)) {
                filenameMap.set(
                    message,
                    path.relative(tmpDir, url.substring(5)),
                );
            }
        }
    });

    return { data, filenameMap };
}
