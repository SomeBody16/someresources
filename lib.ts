import {copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync} from "fs";
import path from "path";
import {MergeProviders} from "./merge";

export function copyRecursiveSync(src: string, dest: string, logPrefix: string) {
    const stack = [{src, dest}];

    while (stack.length > 0) {
        const {src: currentSrc, dest: currentDest} = stack.pop()!;

        if (existsSync(currentSrc) && statSync(currentSrc).isDirectory()) {
            readdirSync(currentSrc).forEach(childItemName => {
                stack.push({
                    src: path.join(currentSrc, childItemName),
                    dest: path.join(currentDest, childItemName)
                });
            });
        } else {
            console.log(`${logPrefix} ${path.relative(__dirname, currentSrc)}...`);
            mkdirSync(path.dirname(currentDest), {recursive: true});
            copyFileSync(currentSrc, currentDest);
        }
    }
}

export function handleMergingSync(srcFilePath: string, destFilePath: string, logPrefix: string) {
    const stack = [{srcFilePath, destFilePath}];

    while (stack.length > 0) {
        const {srcFilePath: currentSrcFilePath, destFilePath: currentDestFilePath} = stack.pop()!;

        if (statSync(currentSrcFilePath).isDirectory()) {
            const files = readdirSync(currentSrcFilePath);
            for (const file of files) {
                stack.push({
                    srcFilePath: path.join(currentSrcFilePath, file),
                    destFilePath: path.join(currentDestFilePath, file)
                });
            }
        } else {
            if (existsSync(currentDestFilePath)) {
                let handled = false;
                for (const provider of MergeProviders) {
                    if (provider.shouldMerge(path.basename(currentSrcFilePath), path.dirname(currentSrcFilePath))) {
                        const providerName = provider.constructor.name;
                        console.log(`${logPrefix} [${providerName}] ${path.relative(__dirname, currentSrcFilePath)}...`);

                        const fileContent = provider.merge(currentSrcFilePath, currentDestFilePath);
                        writeFileSync(currentDestFilePath, fileContent);
                        handled = true;
                        break;
                    }
                }

                if (!handled) {
                    throw new Error(`[ERROR] ${currentSrcFilePath} has no merge provider!`);
                }
            } else {
                console.log(`${logPrefix} ${path.relative(__dirname, currentSrcFilePath)}...`);
                mkdirSync(path.dirname(currentDestFilePath), {recursive: true});
                copyFileSync(currentSrcFilePath, currentDestFilePath);
            }
        }
    }
}
