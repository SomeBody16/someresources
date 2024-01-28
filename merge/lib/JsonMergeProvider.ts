import {PathMergeProvider} from "./PathMergeProvider.ts";
import {readFileSync} from "fs";

export type ShouldMergeCheck = (fileName: string, filePath: string) => boolean

export abstract class JsonMergeProvider extends PathMergeProvider {

    abstract mergeJson(jsonA: any, jsonB: any): any

    merge(fileNameA: string, fileNameB: string): string {
        const jsonA = JSON.parse(readFileSync(fileNameA, "utf8"))
        const jsonB = JSON.parse(readFileSync(fileNameB, "utf8"))

        const merged = this.mergeJson(jsonA, jsonB)
        return JSON.stringify(merged, null, 2)
    }
}
