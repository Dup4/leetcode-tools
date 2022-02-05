import { Problem, Config } from "leetcode-api-typescript";
import * as fs from "fs";
import * as path from "path";
import * as ErrorMsg from "./errorMsg";

export async function New(slug: string, dst?: string) {
    const problem = await Problem.build(slug);

    const targetDirName = `${problem.id}.${problem.slug}`;

    if (dst) {
        dst = path.join(dst, targetDirName);
    } else {
        dst = path.join(process.env.INIT_CWD ?? "", targetDirName);
    }

    if (fs.existsSync(dst)) {
        throw new Error(ErrorMsg.DestinationAlreadyExists);
    }

    fs.mkdirSync(dst, { recursive: true });

    await getStatement(problem, dst);
}

export async function Pull(slug: string, dst: string) {
    const problem = await Problem.build(slug);

    await getStatement(problem, dst);
}

async function getStatement(problem: Problem, dst: string) {
    const statement: Record<string, string> = {
        en_US: "statement.en_US.md",
        zh_CN: "statement.zh_CN.md",
    };

    const statementPath = (() => {
        const statementPath: Record<string, string> = {};
        for (const k in statement) {
            statementPath[k] = path.join(dst, statement[k]);
        }

        return statementPath;
    })();

    for (const k in statementPath) {
        if (fs.existsSync(statementPath[k])) {
            fs.rmSync(statementPath[k]);
        }
    }

    const getProblemLink = (baseUrl: string, slug: string, title: string) => {
        return `<p><strong><a href="${baseUrl}/problems/${slug}/" target="_blank" rel="noopener noreferrer">${title}</a></strong></p>\n\n`;
    };

    if (problem.content) {
        fs.writeFileSync(
            statementPath["en_US"],
            getProblemLink(
                Config.uri.us.base,
                problem.slug as string,
                problem.title as string
            ) + problem.content
        );
    }

    if (problem.translatedContent) {
        fs.writeFileSync(
            statementPath["zh_CN"],
            getProblemLink(
                Config.uri.cn.base,
                problem.slug as string,
                problem.translatedTitle as string
            ) + problem.translatedContent
        );
    }
}
