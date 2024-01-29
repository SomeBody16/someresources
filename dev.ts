import path from "path";
import {fileURLToPath} from "bun";
import {readdirSync} from "fs";
import {copyRecursiveSync} from "./lib.ts";

const log = console.log

// Define the paths for the source and output directories
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const srcPath = path.join(__dirname, 'src');
const outputPath = Bun.env.OUT_PATH || path.join(__dirname, 'out');

console.log('🛫 Starting the resource pack building process...');
console.log(`📂 Source: ${srcPath}`);
console.log(`📂 Output: ${outputPath}`);
console.log(Bun.env.OUT_PATH)

// 1. Copy src/assets to out/assets
console.log('🚀 Copying src...');
const assetsSrcPath = path.join(srcPath, 'assets');
const assetsOutPath = path.join(outputPath, 'assets');
const assetsFiles = readdirSync(assetsSrcPath, {recursive: true});

assetsFiles.forEach(file => {
    if (file instanceof Buffer) return;
    const srcFilePath = path.join(assetsSrcPath, file);
    const destFilePath = path.join(assetsOutPath, file);
    console.log = () => null
    copyRecursiveSync(srcFilePath, destFilePath, `[src]`);
    console.log = log
});

// 2. Copy pack.mcmeta to out/pack.mcmeta
console.log('🗃️ Copying pack.mcmeta...');
console.log = () => null
copyRecursiveSync(path.join(__dirname, 'pack.mcmeta'), path.join(outputPath, 'pack.mcmeta'), `[src]`);
console.log = log

// 3. Copy pack.png to out/pack.png
console.log('🖼️ Copying pack.png...');
// console.log = () => null
copyRecursiveSync(path.join(__dirname, 'pack.png'), path.join(outputPath, 'pack.png'), `[src]`);
console.log = log

console.log('🎉 Done!');
