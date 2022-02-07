import { LangSlug, LangSlugExt } from "leetcode-api-typescript";

export interface Locale {
    en_US?: any;
    zh_CN?: any;
}

const solutionPrefix = "solution";

export function CodeTemplateFileName(langSlug: LangSlug) {
    return `${solutionPrefix}-${LangSlug[langSlug]}.${LangSlugExt(langSlug)}`;
}

export function SolutionFileName(langSlug: LangSlug, filename?: string) {
    const prefix = filename ? filename : solutionPrefix;
    return `${prefix}.${LangSlugExt(langSlug)}`;
}

export function CodeTemplateReplaceContent(langSlug: LangSlug) {
    switch (langSlug) {
        case LangSlug.c:
        case LangSlug.cpp:
        case LangSlug.golang:
            return "// solution class";
        default:
            return "";
    }
}
