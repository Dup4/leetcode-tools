import { LangSlugExt } from "leetcode-api-typescript";
import { LangSlug } from "leetcode-api-typescript";
import fs from "fs";
import path from "path";
import shell from "shelljs";
import * as Constant from "./constant";
import { Locale } from "./interface";

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

        if (_a < _b) return -1;
        if (_a > _b) return 1;

        return 0;
    });

    for (const dir of dirs) {
        buildContestContent(path.join(src, dir), path.join(dst, dir));
        navList.push({ [dir]: path.join(docsRelativePath, dir, "index.md") });
    }

    return navList;
}

function buildProblemContent(src: string, dst: string) {
    const mdContent = `# ${src.split(path.sep).slice(-1)[0]}

${makeContent(src, dst, 2)}

`;

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

${makeContent(path.join(src, dir), path.join(dst, dir), 3)}

`;

        fs.writeFileSync(path.join(dst, "index.md"), mdContent);
    }
}

function makeContent(src: string, dst: string, tocBase: number): string {
    return `
${makeStatementContent(src, dst, tocBase)}

${makeSolutionContent(src, dst, tocBase)}
`;
}

function makeStatementContent(
    src: string,
    dst: string,
    tocBase: number
): string {
    const statementContent = (() => {
        const getContent = (filename: string) => {
            if (!fs.existsSync(path.join(src, filename))) {
                return null;
            }

            return fs
                .readFileSync(path.join(src, filename))
                .toString()
                .replace(/<pre>/g, "<pre><code>")
                .replace(/<pre><code>\n/g, "<pre><code>")
                .replace(/<\/pre>/g, "</code></pre>")
                .replace(/\*/g, "\\*")
                .split("\n")
                .filter((s) => s !== "")
                .map((s) => "    " + s)
                .join("\n");
        };

        const statementContent: Locale<string | null> = {
            en_US: getContent(Constant.StatementFileName.en_US as string),
            zh_CN: getContent(Constant.StatementFileName.zh_CN as string),
        };

        return statementContent;
    })();

    shell.rm("-R", `${dst}/problem-assets/problem.json`);
    shell.rm("-R", `${dst}/*.md`);

    const statementContentList: Array<string> = [];

    if (statementContent.zh_CN) {
        statementContentList.push(`
=== "简体中文"
${statementContent.zh_CN}
`);
    }

    if (statementContent.en_US) {
        statementContentList.push(`
=== "English"
${statementContent.en_US}
`);
    }

    if (statementContentList.length === 0) {
        return "";
    }

    return `
${"#".repeat(tocBase)} Statement

${statementContentList.join("\n")}

`;
}

function makeSolutionContent(
    src: string,
    dst: string,
    tocBase: number
): string {
    const tutorialName = "tutorial";
    const solutionName = "solution";

    const getIdx = (ix: number) => {
        if (ix === 0) {
            return "";
        }

        return ix.toString();
    };

    const solutionContentList = (() => {
        const solutionContentList: Array<string> = [];

        for (let i = 0; ; i++) {
            let content = "";

            const tutorialFileName = `${tutorialName}${getIdx(i)}.md`;

            if (fs.existsSync(path.join(src, tutorialFileName))) {
                content += `
${"#".repeat(tocBase)} Tutorial${getIdx(i)}

--8<-- "${src}/${tutorialFileName}"

                `;

                fs.rmSync(path.join(dst, tutorialFileName));
            }

            let solutionContent = "";

            for (const slug of Object.values(LangSlug)) {
                const ext = LangSlugExt(slug as LangSlug);

                const solutionFileName = `${solutionName}${getIdx(i)}.${ext}`;

                if (fs.existsSync(path.join(src, solutionFileName))) {
                    solutionContent += `
=== "${LangSlug[slug as LangSlug]}"
\`\`\`${ext}
--8<-- "${src}/${solutionFileName}"
\`\`\`
                    `;

                    fs.rmSync(path.join(dst, solutionFileName));
                }
            }

            if (solutionContent.length !== 0) {
                content += `
${"#".repeat(tocBase)} Solution${getIdx(i)}

${solutionContent}
                `;
            }

            if (content === "") {
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
