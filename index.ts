import {
    copyFileSync,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
    writeFileSync
} from 'fs';
import * as path from 'path';
import {MergeProviders} from './merge';
import {fileURLToPath} from "bun";
import JSZip from 'jszip';

// Define the paths for the source and output directories
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const srcPath = path.join(__dirname, 'src');
const dependenciesPath = path.join(__dirname, 'dependencies');
const outputPath = path.join(__dirname, 'out');
const outputZip = path.join(__dirname, 'out.zip');

function copyRecursiveSync(src: string, dest: string, logPrefix: string) {
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

function handleMergingSync(srcFilePath: string, destFilePath: string, logPrefix: string) {
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

console.log('🛫 Starting the resource pack building process...');

// 0. Delete out folder
console.log('🗑️ Deleting out...');
existsSync(outputPath) && rmSync(outputPath, {recursive: true, force: true})
existsSync(outputZip) && rmSync(outputZip, {force: true})

// Create the output directory if it doesn't exist
if (!existsSync(outputPath)) {
    mkdirSync(outputPath, {recursive: true});
}

// 1. Copy pack.mcmeta to out/pack.mcmeta
console.log('🗃️ Copying pack.mcmeta...');
copyFileSync(path.join(__dirname, 'pack.mcmeta'), path.join(outputPath, 'pack.mcmeta'));

// 2. Copy pack.png to out/pack.png
console.log('🖼️ Copying pack.png...');
copyFileSync(path.join(__dirname, 'pack.png'), path.join(outputPath, 'pack.png'));

// 3. Copy src/assets to out/assets
console.log('🚀 Copying src...');
const assetsSrcPath = path.join(srcPath, 'assets');
const assetsOutPath = path.join(outputPath, 'assets');
const assetsFiles = readdirSync(assetsSrcPath, {recursive: true});

assetsFiles.forEach(file => {
    if (file instanceof Buffer) return;
    const srcFilePath = path.join(assetsSrcPath, file);
    const destFilePath = path.join(assetsOutPath, file);
    copyRecursiveSync(srcFilePath, destFilePath, `[src]`);
});

// 4. For each folder in dependencies, handle merging and copying
console.log('👀 Processing dependencies...');
const dependencyFolders = readdirSync(dependenciesPath);

dependencyFolders.forEach(folder => {
    const dependencyAssetsPath = path.join(dependenciesPath, folder, 'assets');
    readdirSync(dependencyAssetsPath).forEach(file => {
        const srcFilePath = path.join(dependencyAssetsPath, file);
        const destFilePath = path.join(assetsOutPath, file);

        handleMergingSync(srcFilePath, destFilePath, `[dependency/${folder}]`)
    });
});

// 5. Zip out folder to [name].zip
console.log('Zipping the output folder...');
const zip = new JSZip();
const outFolderPath = path.join(__dirname, 'out');

function addFolderToZip(folderPath: string, parentZipFolder: JSZip) {
    const files = readdirSync(folderPath);
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = statSync(filePath);
        if (stats.isDirectory()) {
            const childZipFolder = parentZipFolder.folder(file)!;
            addFolderToZip(filePath, childZipFolder);
        } else {
            const fileData = readFileSync(filePath);
            parentZipFolder.file(file, fileData);
        }
    });
}

addFolderToZip(outFolderPath, zip);
zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
    .pipe(createWriteStream(outputZip))
    .on('finish', function () {
        console.log('💚 Resource pack building process completed successfully!');
        console.log(`${path.basename(outputZip)} has been created.`);
    });
