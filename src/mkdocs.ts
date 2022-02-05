import fs from "fs";
import path from "path";
import shell from "shelljs";

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

async function buildProblem(src: string, dst: string, filename: string) {
    const mdTemplate = `# ${filename}

## Statement

??? question
    --8<-- "${src}/statement.en_US.md"

--8<-- "${src}/statement.zh_CN.md"

## Solution

=== "Cpp"
\`\`\`cpp
--8<-- "${dst}/solution.cpp"
\`\`\`
`;

    shell.rm("-R", `${dst}/*.md`);
    fs.writeFileSync(path.join(dst, "index.md"), mdTemplate);
}
