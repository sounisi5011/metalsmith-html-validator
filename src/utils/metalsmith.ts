import Metalsmith from 'metalsmith';
import multimatch from 'multimatch';

import { hasProp, isObject } from './';
import { isReadonlyOrWritableArray } from './types';

export type MetalsmithFileData = Metalsmith.Files[keyof Metalsmith.Files];

export interface FileInterface extends MetalsmithFileData {
    contents: Buffer;
    [index: string]: unknown;
}

export function isFile(value: unknown): value is FileInterface {
    if (isObject(value)) {
        return hasProp(value, 'contents') && Buffer.isBuffer(value.contents);
    }
    return false;
}

export function getMatchedFilenameList(
    files: Metalsmith.Files,
    pattern: string | ReadonlyArray<string>,
): string[] {
    const filenameList = Object.keys(files);
    const matchPatterns = (Array.isArray as isReadonlyOrWritableArray)(pattern)
        ? [...pattern]
        : pattern;
    const matchedFilenameList = multimatch(filenameList, matchPatterns);
    return matchedFilenameList;
}

export function createPlugin(
    callback: (
        files: Metalsmith.Files,
        metalsmith: Metalsmith,
    ) => Promise<void>,
): Metalsmith.Plugin {
    return (files, metalsmith, done) => {
        callback(files, metalsmith)
            .then(() => done(null, files, metalsmith))
            .catch(error => done(error, files, metalsmith));
    };
}

export async function writeFilesAsync(
    files: object,
    dir?: string,
): Promise<Metalsmith.Files> {
    return new Promise((resolve, reject) => {
        Metalsmith('.').write(files, dir, (error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}
