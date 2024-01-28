export abstract class MergeProvider {
    abstract shouldMerge(fileName: string, filePath: string): boolean

    abstract merge(fileNameA: string, filePathB: string): string
}
