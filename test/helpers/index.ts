import fs from 'fs';
import path from 'path';
import util from 'util';

export { removeForceAsync } from '../../src/utils';

export function ignoreTypeError(callback: () => void): void {
    try {
        callback();
    } catch (error) {
        if (!(error instanceof TypeError)) {
            throw error;
        }
    }
}

export const mkdirAsync = util.promisify(fs.mkdir);

export async function readdirAsync(dirpath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dirpath, (error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}

export async function statAsync(filepath: string): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
        fs.stat(filepath, (error, stats) => {
            if (error) {
                reject(error);
            } else {
                resolve(stats);
            }
        });
    });
}

export async function childdirList(parentdirpath: string): Promise<string[]> {
    return (
        await Promise.all(
            (await readdirAsync(parentdirpath)).map(async filename => {
                const filepath = path.join(parentdirpath, filename);
                const stat = await statAsync(filepath);
                return stat.isDirectory() ? filename : null;
            }),
        )
    ).filter((filename): filename is string => filename !== null);
}
