import {MergeProvider} from "./lib/MergeProvider.ts";
import {FontDefaultMergeProvider} from "./provider/FontDefaultMergeProvider.ts";
import {LangMergeProvider} from "./provider/LangMergeProvider.ts";

export const MergeProviders: MergeProvider[] = [
    new FontDefaultMergeProvider(),
    new LangMergeProvider(),
]
