import deepFreeze from 'deep-freeze-strict';
import Metalsmith from 'metalsmith';

import chalk = require('chalk');

export interface OptionsInterface {
    readonly pattern: string | ReadonlyArray<string>;
    readonly logger: (str: string) => void;
    readonly chalk: chalk.Chalk | false | null;
}

export interface OptionsGenerator {
    (
        files: Metalsmith.Files,
        metalsmith: Metalsmith,
        defaultOptions: OptionsInterface,
    ): Partial<OptionsInterface> | Promise<Partial<OptionsInterface>>;
}

const defaultOptions: OptionsInterface = Object.freeze({
    ...deepFreeze({
        pattern: ['**/*.{html,htm}'],
        logger: console.error,
    }),
    chalk: chalk.stderr,
});

export async function normalizeOptions(
    files: Metalsmith.Files,
    metalsmith: Metalsmith,
    opts: Partial<OptionsInterface> | OptionsGenerator,
): Promise<OptionsInterface> {
    const partialOptions: Partial<OptionsInterface> =
        typeof opts === 'function'
            ? await opts(files, metalsmith, defaultOptions)
            : opts;
    return {
        ...defaultOptions,
        ...partialOptions,
    };
}
