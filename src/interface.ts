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

const StatementFileNamePrefix = "statement";
const TutorialFileNamePrefix = "tutorial";
const SolutionFileNamePrefix = "solution";

export function StatementFileName(locale: LocaleEnum): string {
    return `${StatementFileNamePrefix}.${locale as string}.md`;
}

export function TutorialFileName(locale: LocaleEnum, idx: string): string {
    return `${TutorialFileNamePrefix}${idx}.${locale as string}.md`;
}

export function SolutionFileName(
    langSlug: LangSlug,
    idx: string,
    options?: { fileName?: string }
) {
    const prefix = options?.fileName ?? SolutionFileNamePrefix;
    return `${prefix}${idx}.${LangExt(langSlug)}`;
}

export function CodeTemplateFileName(langSlug: LangSlug) {
    return `${SolutionFileNamePrefix}-${LangSlug[langSlug]}.${LangExt(
        langSlug
    )}`;
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
