import createDebug from 'debug';
import path from 'path';
import onExit from 'signal-exit';
import vnuJar from 'vnu-jar';

import {
    exec,
    promiseFinally,
    removeForceAsync,
    removeForceSync,
    tmpDirAsync,
} from './utils';
import { FileInterface, writeFilesAsync } from './utils/metalsmith';

const debug = createDebug(require('../package.json').name).extend('validator');

/**
 * @see https://github.com/validator/validator/wiki/Output-»-JSON
 */
export interface VNuRoot {
    readonly messages: ReadonlyArray<VNuMessage>;
    readonly url?: string;
    readonly source?: {
        readonly code: string;
        readonly type?: string;
        readonly encoding?: string;
    };
    readonly language?: string;
}

export type VNuMessage = VNuInfoMessage | VNuErrorMessage | VNuDocErrorMessage;

export interface VNuMessageBase {
    readonly type: string;
    readonly subType?: string;
    readonly message?: string;
    readonly extract?: string;
    readonly offset?: number;
    readonly url?: string;
    readonly firstLine?: number;
    readonly firstColumn?: number;
    readonly lastLine?: number;
    readonly lastColumn?: number;
    readonly hiliteStart?: number;
    readonly hiliteLength?: number;
}

export interface VNuInfoMessage extends VNuMessageBase {
    readonly type: 'info';
    readonly subType?: 'warning';
}

export interface VNuErrorMessage extends VNuMessageBase {
    readonly type: 'error';
    readonly subType?: 'fatal';
}

export interface VNuDocErrorMessage extends VNuMessageBase {
    readonly type: 'non-document-error';
    readonly subType?: 'io' | 'schema' | 'internal';
}

export async function validateContent(
    content: string | Buffer,
    options: ReadonlyArray<string> = [],
    javaOptions: ReadonlyArray<string> = [],
): Promise<{ data: VNuRoot; filenameMap: WeakMap<VNuMessageBase, string> }> {
    const result = await exec(
        'java',
        [...javaOptions, '-jar', vnuJar, ...options, '--format', 'json', '-'],
        { input: content },
    );
    const data: VNuRoot = JSON.parse(result.stderr.toString());
    return { data, filenameMap: new WeakMap() };
}

export async function validateFiles(
    files: Record<string, FileInterface>,
    options: ReadonlyArray<string> = [],
    javaOptions: ReadonlyArray<string> = [],
): Promise<{ data: VNuRoot; filenameMap: WeakMap<VNuMessageBase, string> }> {
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

    const data: VNuRoot = JSON.parse(result.stderr.toString());

    const filenameMap = new WeakMap<VNuMessageBase, string>();
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
