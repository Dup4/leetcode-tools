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

        const statementContent: Locale<string> = {
            en_US: getContent(Constant.StatementFileName.en_US as string),
            zh_CN: getContent(Constant.StatementFileName.zh_CN as string),
        };

        return statementContent;
    })();

    shell.rm("-R", `${dst}/problem-assets/problem.json`);
    shell.rm("-R", `${dst}/*.md`);

    return `
${"#".repeat(tocBase)} Statement

=== "简体中文"
${statementContent.zh_CN}

=== "English"
${statementContent.en_US}

`;
}

function makeSolutionContent(
    src: string,
    dst: string,
    tocBase: number
): string {
    shell.rm("-R", `${dst}/*.cpp`);

    return `
${"#".repeat(tocBase)} Solution

=== "Cpp"
\`\`\`cpp
--8<-- "${src}/solution.cpp"
\`\`\`

`;
}
