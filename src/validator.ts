import createDebug from 'debug';
import path from 'path';
import onExit from 'signal-exit';
import url from 'url';
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

import fileUriToPath = require('file-uri-to-path');

const debug = createDebug(require('../package.json').name).extend('validator');

const fileURLToPath =
    typeof url.fileURLToPath === 'function'
        ? /**
           * If available, use the Node.js built-in fileURLToPath function
           * @see https://nodejs.org/api/url.html#url_url_fileurltopath_url
           */
          url.fileURLToPath
        : (fileurl: string): string =>
              fileUriToPath(
                  fileurl
                      /**
                       * Unify URL scheme to lower case
                       * @see https://stackoverflow.com/a/2148663/4907315
                       * @see https://github.com/TooTallNate/file-uri-to-path/blob/2.0.0/src/index.ts#L15
                       */
                      .replace(/^file:/i, 'file:')
                      /**
                       * Add optional "//"
                       * @see https://github.com/TooTallNate/file-uri-to-path/issues/7
                       * @see http://eed3si9n.com/ja/encoding-file-path-as-URI-reference
                       */
                      .replace(/^file:(?!\/\/)\/*/, 'file:///'),
              );

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
    const _xDbg = new Set<string>();
    data.messages.forEach(message => {
        const { url } = message;
        if (url) {
            if (/^file:/.test(url)) {
                const filepath = fileURLToPath(url);

                if (!_xDbg.has(url)) {
                    console.log(
                        '\n',
                        {
                            tmpDir,
                            url,
                            filepath,
                            filename: path.relative(tmpDir, filepath),
                        },
                        '\n',
                    );
                    _xDbg.add(url);
                }

                filenameMap.set(message, path.relative(tmpDir, filepath));
            }
        }
    });

    return { data, filenameMap };
}
