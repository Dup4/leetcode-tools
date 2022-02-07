import fs from "fs";
import path from "path";
import shell from "shelljs";
import * as Constant from "./constant";
import { Locale } from "./interface";
import Html2Md from "./html-to-markdown";

export async function Build(
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
        buildProblem(path.join(src, dir), path.join(dst, dir), dir);
        navList.push({ [dir]: path.join(docsRelativePath, dir, "index.md") });
    }

    return navList;
}

function buildProblem(src: string, dst: string, filename: string): void {
    const mdTemplate = `# ${filename}

${makeStatementContent(src, dst)}

${makeSolutionContent(src, dst)}

`;

    fs.writeFileSync(path.join(dst, "index.md"), mdTemplate);
}

function makeStatementContent(src: string, dst: string): string {
    const statementContent = (() => {
        const getContent = (filename: string) => {
            return Html2Md.translate(
                fs.readFileSync(path.join(src, filename)).toString()
            )
                .split("\n")
                .map((s) => "    " + s)
                .join("\n");
        };

        const statementContent: Locale = {
            en_US: getContent(Constant.StatementFileName.en_US),
            zh_CN: getContent(Constant.StatementFileName.zh_CN),
        };

        return statementContent;
    })();

    shell.rm("-R", `${dst}/*.md`);
    return `
## Statement

=== "English"
${statementContent.en_US}

===! "简体中文"
${statementContent.zh_CN}

`;
}

function makeSolutionContent(src: string, dst: string): string {
    shell.rm("-R", `${dst}/*.cpp`);

    return `
## Solution

=== "Cpp"
\`\`\`cpp
--8<-- "${src}/solution.cpp"
\`\`\`

`;
}
