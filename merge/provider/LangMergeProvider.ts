import {JsonMergeProvider} from "../lib/JsonMergeProvider.ts";

export class LangMergeProvider extends JsonMergeProvider {
    constructor() {
        super(/lang\/.+\.json/);
    }

    mergeJson(jsonA: any, jsonB: any): any {
        return {
            ...jsonA,
            ...jsonB,
        }
    }
}
