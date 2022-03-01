import { LangText, LangSlug, LangExt } from "leetcode-api-typescript";
import fs from "fs";
import path from "path";
import * as Constant from "./constant";
import {
    LocaleEnum,
    LocaleText,
    SolutionFileName,
    StatementFileName,
    TutorialFileName,
} from "./interface";
import { GetIdx } from "./utils";

export function Build(name: string) {
    if (name === "problems") {
        return BuildProblemSet;
    }

    return BuildContest;
}

export async function BuildProblemSet(
    src: string,
    dst: string,
    docsRelativePath: string
): Promise<any> {
    const navList: Array<Record<string, string>> = [];

    const dirs = fs.readdirSync(src);
    dirs.sort((a: string, b: string) => {
        const _a = Number(a.split(".")[0]);
        const _b = Number(b.split(".")[0]);

        if (_a < _b) {
            return -1;
        }

        if (_a > _b) {
            return 1;
        }

        return 0;
    });

    for (const dir of dirs) {
        buildProblemContent(path.join(src, dir), path.join(dst, dir));
        navList.push({ [dir]: path.join(docsRelativePath, dir, "index.md") });
    }

    return navList;
}

export async function BuildContest(
    src: string,
    dst: string,
    docsRelativePath: string
): Promise<any> {
    const navList: Array<Record<string, string>> = [];

    const dirs = fs.readdirSync(src);
    dirs.sort((a: string, b: string) => {
        const _a = Number(a);
        const _b = Number(b);

        if (_a < _b) return 1;
        if (_a > _b) return -1;

        return 0;
    });

    for (const dir of dirs) {
        buildContestContent(path.join(src, dir), path.join(dst, dir));
        navList.push({ [dir]: path.join(docsRelativePath, dir, "index.md") });
    }

    return navList;
}

function buildProblemContent(src: string, dst: string) {
    const problemJsonFilePath = path.join(
        src,
        Constant.ProblemAssetsName,
        "problem.json"
    );

    let mdContent = "---\n";

    if (fs.existsSync(problemJsonFilePath)) {
        const problemJsonContent = JSON.parse(
            fs.readFileSync(problemJsonFilePath).toString()
        );
        mdContent += makeTags(problemJsonContent);
    }

    mdContent += "\n---\n";
    mdContent += `# ${src.split(path.sep).slice(-1)[0]}`;
    mdContent += makeContent(src, dst, 2);

    fs.writeFileSync(path.join(dst, "index.md"), mdContent);
}

function buildContestContent(src: string, dst: string) {
    let mdContent = `# ${src.split(path.sep).slice(-2).join("-")}`;
    const dirs = fs.readdirSync(src);
    dirs.sort();

    for (const dir of dirs) {
        mdContent += `
## ${String.fromCharCode(
            "A".charCodeAt(0) + (dir.charCodeAt(0) - "a".charCodeAt(0))
        )}

${makeContent(path.join(src, dir), path.join(dst, dir), 3).replace(
    new RegExp(Constant.ProblemAssetsName, "g"),
    `${dir}/${Constant.ProblemAssetsName}`
)}

`;

        fs.writeFileSync(path.join(dst, "index.md"), mdContent);
    }
}

function makeContent(src: string, dst: string, tocBase: number): string {
    const problemJsonFilePath = path.join(
        dst,
        Constant.ProblemAssetsName,
        "problem.json"
    );

    if (fs.existsSync(problemJsonFilePath)) {
        fs.rmSync(problemJsonFilePath);
    }

    let content = "";

    content += "\n" + makeStatementContent(src, dst, tocBase);
    content += "\n" + makeTutorialAndSolutionContent(src, dst, tocBase);

    return content;
}

function makeTags(problemJsonContent: any) {
    let content = "tags:\n";

    problemJsonContent?.tag.forEach((tag: any) => {
        content += `    - ${tag.name}\n`;
    });

    return content;
}

function makeStatementContent(
    src: string,
    dst: string,
    tocBase: number
): string {
    const statementContent: string = (() => {
        let content = "";

        for (const locale in LocaleEnum) {
            const statementFileName = StatementFileName(locale as LocaleEnum);
            const statementSrcPath = path.join(src, statementFileName);
            const statementDstPath = path.join(dst, statementFileName);

            if (fs.existsSync(statementSrcPath)) {
                const statementContent = fs
                    .readFileSync(statementSrcPath)
                    .toString()
                    .replace(/<pre>/g, "<pre><code>")
                    .replace(/<pre><code>\n/g, "<pre><code>")
                    .replace(/<\/pre>/g, "</code></pre>")
                    .replace(/\*/g, "\\*")
                    .split("\n")
                    .filter((s) => s !== "")
                    .map((s) => "    " + s)
                    .join("\n");

                content += `
=== "${LocaleText[locale as LocaleEnum]}"
${statementContent}
`;
                fs.rmSync(statementDstPath);
            }
        }

        return content;
    })();

    if (statementContent.length === 0) {
        return "";
    }

    return `
${"#".repeat(tocBase)} Statement

${statementContent}
`;
}

function makeTutorialAndSolutionContent(
    src: string,
    dst: string,
    tocBase: number
): string {
    const solutionContentList = (() => {
        const solutionContentList: Array<string> = [];

        for (let i = 0; ; i++) {
            let content = "";

            const tutorialContent: string = (() => {
                let content = "";

                for (const locale in LocaleEnum) {
                    const tutorialFileName = TutorialFileName(
                        locale as LocaleEnum,
                        GetIdx(i)
                    );
                    const tutorialFileSrcPath = path.join(
                        src,
                        tutorialFileName
                    );
                    const tutorialFileDstPath = path.join(
                        dst,
                        tutorialFileName
                    );

                    if (fs.existsSync(tutorialFileSrcPath)) {
                        content += `
=== "${LocaleText[locale as LocaleEnum]}"
--8<-- "${tutorialFileSrcPath}"
`;
                        fs.rmSync(tutorialFileDstPath);
                    }
                }

                return content;
            })();

            if (tutorialContent.length !== 0) {
                content += `
${"#".repeat(tocBase)} Tutorial${GetIdx(i)}

${tutorialContent}
`;
            }

            const solutionContent: string = (() => {
                let content = "";

                for (const langSlug in LangSlug) {
                    const langExt = LangExt(langSlug as LangSlug);
                    const solutionFileName = SolutionFileName(
                        langSlug as LangSlug,
                        GetIdx(i)
                    );
                    const solutionSrcPath = path.join(src, solutionFileName);
                    const solutionDstPath = path.join(dst, solutionFileName);

                    if (fs.existsSync(solutionSrcPath)) {
                        const codeContent = fs.readFileSync(solutionSrcPath).toString().split("\n").map(s => "    " + s).join("\n");

                        content += `
=== "${LangText[langSlug as LangSlug]}"

    \`\`\`${langExt}
${codeContent}
    \`\`\`
`;

                        fs.rmSync(solutionDstPath);
                    }
                }

                return content;
            })();

            if (solutionContent.length !== 0) {
                content += `
${"#".repeat(tocBase)} Solution${GetIdx(i)}

${solutionContent}
`;
            }

            if (content.length === 0) {
                break;
            }

            solutionContentList.push(content);
        }

        return solutionContentList;
    })();

    if (solutionContentList.length === 0) {
        return "";
    }

    return solutionContentList.join("\n");
}
