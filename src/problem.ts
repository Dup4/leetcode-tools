import { Problem, Config, LangSlug } from "leetcode-api-typescript";
import * as fs from "fs";
import * as path from "path";
import * as ErrorMsg from "./errorMsg";
import Log from "./log";
import { CodeTemplateReplaceContent } from "./interface";
import { Sleep } from "./utils";

export async function New(slug: string, dst: string) {
    const problem = await Problem.build(slug);

    const targetDirName = `${problem.id}.${problem.slug}`;

    dst = path.join(dst, targetDirName);

    if (fs.existsSync(dst)) {
        throw new Error(`${ErrorMsg.DestinationAlreadyExists}. [dst=${dst}]`);
    }

    fs.mkdirSync(dst, { recursive: true });

    await DownloadProblem(problem, dst);
}

export async function Pull(slug: string, dst: string) {
    const problem = await Problem.build(slug);
    await DownloadProblem(problem, dst);
}

export async function DownloadProblem(problem: Problem, dst: string) {
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
            Log.Warn(
                `${ErrorMsg.DestinationAlreadyExists}, will be removed. [dst=${statementPath[k]}`
            );

            fs.rmSync(statementPath[k]);
        }
    }

    const getProblemLink = (baseUrl: string, slug: string, title: string) => {
        return `<p><strong><a href="${baseUrl}problems/${slug}/" target="_blank" rel="noopener noreferrer">${title}</a></strong></p>\n\n`;
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

        Log.Info(
            `pull statement successfully. [path=${statementPath["en_US"]}]`
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

        Log.Info(
            `pull statement successfully. [path=${statementPath["zh_CN"]}]`
        );
    }
}

export async function Code(
    slug: string,
    langSlug: LangSlug,
    template: string,
    dst: string
) {
    const problem = await Problem.build(slug);

    for (const codeSnippet of problem.codeSnippets ?? []) {
        if (codeSnippet.langSlug === LangSlug[langSlug]) {
            if (fs.existsSync(dst)) {
                throw new Error(
                    `${ErrorMsg.DestinationAlreadyExists}. [dst=${dst}]`
                );
            }

            fs.writeFileSync(
                dst,
                template.replace(
                    CodeTemplateReplaceContent(langSlug),
                    codeSnippet.code
                )
            );

            Log.Info(`generate code successfully. [dst=${dst}]`);
            return;
        }
    }

    throw new Error(
        `${ErrorMsg.UnsupportedLangslugType}. [langSlug=${langSlug}]`
    );
}

export async function Submit(slug: string, langSlug: LangSlug, code: string) {
    const problem = await Problem.build(slug);
    const submission = await problem.submit(langSlug, code);

    Log.Info(
        `submit successfully. [slug=${slug}, langSlug=${LangSlug[langSlug]}]`
    );

    for (let i = 0; i < 3; i++) {
        await submission.detail();
        if (submission.statusDisplay === "") {
            Sleep(500);
            continue;
        }
    }

    Log.Info(`id: ${submission.id}
lang: ${submission.lang}
runtime: ${submission.runtime}
memory: ${submission.memory}
status: ${submission.statusDisplay}
timestamp: ${submission.timestamp}
submissionUrl: ${submission.getSubmissionUrl()}`);
}
