import Metalsmith from 'metalsmith';

export async function readAsync(
    metalsmith: Metalsmith,
): Promise<Metalsmith.Files> {
    return new Promise((resolve, reject) => {
        metalsmith.read((error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}

export async function processAsync(
    metalsmith: Metalsmith,
): Promise<Metalsmith.Files> {
    return new Promise((resolve, reject) => {
        metalsmith.process((error, files) => {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        });
    });
}
