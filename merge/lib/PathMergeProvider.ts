import {MergeProvider} from "./MergeProvider.ts";
import * as path from 'path'

export abstract class PathMergeProvider extends MergeProvider {

    protected path: RegExp | string;

    constructor(path: RegExp | string) {
        super();
        this.path = path;
    }

    shouldMerge(fileName: string, filePath: string) {
        const regex = new RegExp(this.path);
        const fullPath = path.join(filePath, fileName);
        return fullPath.match(regex) !== null;
    }
}
