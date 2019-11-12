import createDebug from 'debug';
import Metalsmith from 'metalsmith';

import {
    normalizeOptions,
    OptionsGenerator,
    OptionsInterface,
} from './options';
import { VNuJSONSchema, VNuMessageObject } from './schemas/vnu-jar';
import { compareUnicode, hasProp, replaceLine } from './utils';
import {
    createPlugin,
    getMatchedFilenameList,
    isFile,
} from './utils/metalsmith';
import { validateContent, validateFiles } from './validator';

import chalk = require('chalk');

const debug = createDebug(require('../package.json').name);

function hiliteExtract(
    message: VNuMessageObject,
    chalkCtx: chalk.Chalk | null,
): string {
    if (!hasProp(message, 'extract')) {
        return '';
    }

    if (hasProp(message, 'hiliteStart') || hasProp(message, 'hiliteLength')) {
        const {
            extract,
            hiliteStart = 0,
            hiliteLength = extract.length,
        } = message;
        const hiliteEnd = hiliteStart + hiliteLength;
        const hiliteExtract = extract.substring(hiliteStart, hiliteEnd);
        return (
            extract.substring(0, hiliteStart) +
            (chalkCtx
                ? replaceLine(hiliteExtract, chalkCtx.yellowBright.inverse)
                : hiliteExtract) +
            extract.substring(hiliteEnd)
        );
    } else {
        return message.extract;
    }
}

function message2str(
    message: VNuMessageObject,
    chalkCtx: chalk.Chalk | null,
): string {
    let typeColor = (text: string): string => text;
    if (chalkCtx) {
        switch (message.type) {
            case 'info':
                typeColor =
                    message.subType === 'warning'
                        ? chalkCtx.yellow
                        : chalkCtx.cyan;
                break;
            case 'error':
                typeColor = chalkCtx.red;
                break;
            case 'non-document-error':
                typeColor = chalkCtx.red.bgBlack.bold;
                break;
        }
    }

    return [
        '* ' +
            typeColor(
                message.type +
                    (hasProp(message, 'subType') ? `/${message.subType}` : ''),
            ) +
            (hasProp(message, 'message') ? `: ${message.message}` : ''),
        ...(hasProp(message, 'firstLine') ||
        hasProp(message, 'firstColumn') ||
        hasProp(message, 'lastLine') ||
        hasProp(message, 'lastColumn')
            ? [
                  '',
                  '  ' +
                      (hasProp(message, 'firstColumn') &&
                      hasProp(message, 'lastColumn')
                          ? `From line ${
                                hasProp(message, 'firstLine')
                                    ? message.firstLine
                                    : message.lastLine
                            }, column ${message.firstColumn}; to line ${
                                message.lastLine
                            }, column ${message.lastColumn}`
                          : `At line ${message.lastLine}, column ${message.lastColumn}`),
              ]
            : []),
        ...(hasProp(message, 'extract')
            ? ['', hiliteExtract(message, chalkCtx).replace(/^(?!$)/gm, '  > ')]
            : []),
    ]
        .map(line => line.replace(/^(?!$)/gm, '  '))
        .join('\n');
}

function vnuData2text(
    data: VNuJSONSchema,
    options: {
        getPath: (message: VNuMessageObject) => string;
        chalkCtx: chalk.Chalk | null;
    },
): string {
    const messagesMap = data.messages.reduce((map, message) => {
        const path = options.getPath(message);
        map.set(path, [...(map.get(path) || []), message]);
        return map;
    }, new Map<string, VNuMessageObject[]>());

    return [...messagesMap.entries()]
        .sort(([a], [b]) => compareUnicode(a, b))
        .map(([path, messages]) =>
            [
                `${path}:`,
                ...messages.map(message =>
                    message2str(message, options.chalkCtx),
                ),
            ].join('\n\n'),
        )
        .join('\n\n');
}

export = (
    opts: Partial<OptionsInterface> | OptionsGenerator = {},
): Metalsmith.Plugin => {
    return createPlugin(async (files, metalsmith) => {
        const options = await normalizeOptions(files, metalsmith, opts);
        const matchedFilenameList = getMatchedFilenameList(
            files,
            options.pattern,
        );
        const targetFilenameList = matchedFilenameList.filter(filename =>
            isFile(files[filename]),
        );

        if (targetFilenameList.length <= 0) {
            return;
        }

        debug(
            'validate %d files: %o',
            targetFilenameList.length,
            targetFilenameList,
        );

        const [{ data, filenameMap }, defaultPath] =
            targetFilenameList.length > 1
                ? [
                      await validateFiles(
                          targetFilenameList.reduce<Metalsmith.Files>(
                              (obj, filename) => ({
                                  ...obj,
                                  [filename]: files[filename],
                              }),
                              {},
                          ),
                      ),
                      '',
                  ]
                : [
                      await validateContent(
                          files[targetFilenameList[0]].contents,
                      ),
                      targetFilenameList[0],
                  ];

        const result = vnuData2text(data, {
            getPath: message =>
                filenameMap.get(message) || message.url || defaultPath,
            chalkCtx: options.chalk || null,
        });
        options.logger(result);

        if (
            data.messages.some(
                message =>
                    message.type === 'error' ||
                    message.type === 'non-document-error',
            )
        ) {
            debug('detect invalid HTML');
            throw new Error('Some files are invalid HTML');
        }
    });
};
