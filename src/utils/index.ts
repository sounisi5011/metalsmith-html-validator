import childProcess from 'child_process';
import spawn from 'cross-spawn';
import createDebug from 'debug';
import rimraf from 'rimraf';
import shellescape from 'shell-escape';
import tmp from 'tmp';

const debug = createDebug(require('../../package.json').name);
const execDebug = debug.extend('exec');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isObject(value: unknown): value is Record<any, unknown> {
    return typeof value === 'object' && value !== null;
}

export function hasProp<
    T extends object,
    U extends Parameters<typeof Object.prototype.hasOwnProperty>[0]
>(value: T, prop: U): value is T & Required<Pick<T, Extract<keyof T, U>>> {
    return Object.prototype.hasOwnProperty.call(value, prop);
}

export function replaceLine(
    str: string,
    replaceFunc: (line: string) => string,
): string {
    return str.replace(/.+/g, line => replaceFunc(line));
}

export function compareUnicode(a: string, b: string): number {
    const aChars = [...a];
    const bChars = [...b];
    const aLen = aChars.length;
    const bLen = bChars.length;

    const minLen = Math.min(aLen, bLen);
    for (let index = 0; index < minLen; index++) {
        const aCode = aChars[index].codePointAt(0);
        const bCode = bChars[index].codePointAt(0);

        if (typeof aCode !== 'number' || typeof bCode !== 'number') {
            continue;
        }

        if (aCode !== bCode) {
            return aCode - bCode;
        }
    }

    return aLen - bLen;
}

export async function promiseFinally<T>(
    promise: Promise<T>,
    onfinally: () => void | Promise<void>,
): Promise<T> {
    if (typeof promise.finally === 'function') {
        return promise.finally(onfinally);
    } else {
        return promise
            .then(async value => {
                await onfinally();
                return value;
            })
            .catch(async error => {
                await onfinally();
                throw error;
            });
    }
}

export async function removeForceAsync(
    path: string,
    options: rimraf.Options = {},
): Promise<void> {
    return new Promise((resolve, reject) => {
        rimraf(path, { ...options, disableGlob: true }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

export function removeForceSync(
    path: string,
    options: rimraf.Options = {},
): void {
    rimraf.sync(path, { ...options, disableGlob: true });
}

export async function tmpDirAsync(options: tmp.DirOptions): Promise<string> {
    return new Promise((resolve, reject) => {
        tmp.dir(options, (error, name) => {
            if (error) {
                reject(error);
            } else {
                resolve(name);
            }
        });
    });
}

export async function exec(
    command: string,
    args?: ReadonlyArray<string>,
    options?: childProcess.SpawnOptions & { input?: string | Buffer },
): Promise<{ stdout: Buffer; stderr: Buffer; status: number; signal: string }> {
    return new Promise((resolve, reject) => {
        const { input, ...opts } = options || {};

        execDebug(
            `starting vnu.jar: %s`,
            shellescape([command, ...(args || [])]),
        );
        const process = spawn(command, args && [...args], options && opts);
        const stdoutList: Buffer[] = [];
        const stderrList: Buffer[] = [];

        if (process.stdout) {
            process.stdout.on('data', data => {
                stdoutList.push(data);
            });
        }

        if (process.stderr) {
            process.stderr.on('data', data => {
                stderrList.push(data);
            });
        }

        process.on('close', (code, signal) => {
            resolve({
                stdout: Buffer.concat(stdoutList),
                stderr: Buffer.concat(stderrList),
                status: code,
                signal,
            });
        });

        process.on('error', error => {
            reject(error);
        });

        execDebug('vnu.jar started: pid=%d', process.pid);

        if (process.stdin && (typeof input === 'string' || input)) {
            process.stdin.write(input);
            process.stdin.end();
        }
    });
}
