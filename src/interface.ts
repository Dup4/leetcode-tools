import { LangSlug, LangExt } from "leetcode-api-typescript";

export enum LocaleEnum {
    en_US = "en_US",
    zh_CN = "zh_CN",
}

export const LocaleText: Record<LocaleEnum, string> = {
    [LocaleEnum.en_US]: "English",
    [LocaleEnum.zh_CN]: "简体中文",
};

export interface Locale<T> {
    en_US?: T;
    zh_CN?: T;
}

const solutionPrefix = "solution";

export function CodeTemplateFileName(langSlug: LangSlug) {
    return `${solutionPrefix}-${LangSlug[langSlug]}.${LangExt(langSlug)}`;
}

export function SolutionFileName(langSlug: LangSlug, filename?: string) {
    const prefix = filename ? filename : solutionPrefix;
    return `${prefix}.${LangExt(langSlug)}`;
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
