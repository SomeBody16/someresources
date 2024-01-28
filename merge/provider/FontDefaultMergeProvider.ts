import {JsonMergeProvider} from "../lib/JsonMergeProvider.ts";

export class FontDefaultMergeProvider extends JsonMergeProvider {
    constructor() {
        super('font/default.json');
    }

    mergeJson(jsonA: any, jsonB: any): any {
        const providersA = jsonA.providers as any[];
        const providersB = jsonB.providers as any[];

        const providers = providersA.concat(providersB);
        return {
            providers
        }
    }

}
