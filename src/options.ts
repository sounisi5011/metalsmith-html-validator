import chalk, { Chalk } from 'chalk';
import deepFreeze from 'deep-freeze-strict';
import Metalsmith from 'metalsmith';
import supportsColor from 'supports-color';

export interface OptionsInterface {
    readonly pattern: string | ReadonlyArray<string>;
    readonly logger: (str: string) => void;
    readonly chalk: Chalk | false | null;
}

export interface OptionsGenerator {
    (
        files: Metalsmith.Files,
        metalsmith: Metalsmith,
        defaultOptions: OptionsInterface,
    ): Partial<OptionsInterface> | Promise<Partial<OptionsInterface>>;
}

const defaultOptions: OptionsInterface = deepFreeze({
    pattern: ['**/*.{html,htm}'],
    logger: console.error,
    chalk: new chalk.Instance({
        level: supportsColor.stderr ? supportsColor.stderr.level : 0,
    }),
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
