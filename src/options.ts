import deepFreeze from 'deep-freeze-strict';
import Metalsmith from 'metalsmith';

export interface OptionsInterface {
    readonly pattern: string | ReadonlyArray<string>;
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
