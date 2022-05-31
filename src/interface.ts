import { LangSlug, LangExt } from "leetcode-api-typescript";

export enum LocaleEnum {
  zh_CN = "zh_CN",
  en_US = "en_US",
}

export const LocaleText: Record<LocaleEnum, string> = {
  [LocaleEnum.zh_CN]: "简体中文",
  [LocaleEnum.en_US]: "English",
};

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
  options?: { fileName?: string },
) {
  const prefix = options?.fileName ?? SolutionFileNamePrefix;
  return `${prefix}${idx}.${LangExt(langSlug)}`;
}

export function CodeTemplateFileName(langSlug: LangSlug) {
  return `${SolutionFileNamePrefix}-${LangSlug[langSlug]}.${LangExt(langSlug)}`;
}

export function CodeTemplateReplaceContent(langSlug: LangSlug) {
  switch (langSlug) {
    case LangSlug.c:
    case LangSlug.cpp:
    case LangSlug.golang:
    case LangSlug.java:
    case LangSlug.javascript:
    case LangSlug.typescript:
      return "// solution class";
    case LangSlug.python:
    case LangSlug.python3:
      return "# solution class";
    default:
      return "";
  }
}
