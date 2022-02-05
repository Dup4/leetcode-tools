import fs from "fs";
import path from "path";

export async function Build(
    src: string,
    docsRelativePath: string
): Promise<any> {
    const navList: Array<Record<string, string>> = [];

    const dirs = fs.readdirSync(src);
    for (const dir of dirs) {
        buildProblem(path.join(src, dir), dir);
        navList.push({ [dir]: path.join(docsRelativePath, dir, "index.md") });
    }

    return navList;
}

async function buildProblem(src: string, filename: string) {
    const mdTemplate = `# ${filename}

## Statement

    === "English"
    --8<-- "statement.en_US.md"

    === "简体中文"
    --8<-- "statement.zh_CN.md"


## Solution

    === "Cpp"
    \`\`\`cpp
    --8<-- "solution.cpp"
    \`\`\`
`;

    fs.writeFileSync(path.join(src, "index.md"), mdTemplate);
}
