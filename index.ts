import {copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync} from 'fs';
import * as path from 'path';
import {fileURLToPath} from "bun";
import JSZip from 'jszip';
import {copyRecursiveSync, handleMergingSync} from "./lib.ts";

// Define the paths for the source and output directories
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const srcPath = path.join(__dirname, 'src');
const dependenciesPath = path.join(__dirname, 'dependencies');
const outputPath = path.join(__dirname, 'out');
const outputZip = path.join(__dirname, 'out.zip');

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
