import { Locale } from "./interface";

export const StatementFileNamePrefix = "statement";
export const TutorialFileNamePrefix = "tutorial";
export const SolutionFileNamePrefix = "solution";

export const StatementFileName: Locale<string> = {
    en_US: "statement.en_US.md",
    zh_CN: "statement.zh_CN.md",
};

export const MkdocsTabTitle: Record<string, string> = {
    problems: "Problems",
    "weekly-contest": "Weekly Contest",
    "biweekly-contest": "Biweekly Contest",
};

export const ProblemAssetsName = "problem-assets";
