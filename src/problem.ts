import { problemAssetsName, StatementFileName } from "./constant";
import {
    Problem,
    LangSlug,
    ProblemDifficulty,
    TopicTag,
    Config,
} from "leetcode-api-typescript";
import * as fs from "fs";
import * as path from "path";
import * as ErrorMsg from "./errorMsg";
import Log from "./log";
import { CodeTemplateReplaceContent, Locale, LocaleEnum } from "./interface";
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
    const problemAssetsPath = path.join(dst, problemAssetsName);

    if (fs.existsSync(problemAssetsPath)) {
        Log.Warn(
            `${ErrorMsg.DestinationAlreadyExists}, will be removed. [dst=${problemAssetsPath}]`
        );

        fs.rmSync(problemAssetsPath, { recursive: true });
    }

    fs.mkdirSync(problemAssetsPath, { recursive: true });

    const problemContent = JSON.parse(JSON.stringify(problem));
    const contentImages = await problem.getContentImages();

    const downloadImages = (mp: Map<string, string>, content: string) => {
        for (const key of mp.keys()) {
            const replaceKey = key.replace(/\//g, "-");

            content = content.replace(
                key,
                path.join(problemAssetsName, replaceKey)
            );

            const downloadPath = path.join(problemAssetsPath, replaceKey);
            fs.writeFileSync(downloadPath, mp.get(key) as string, "binary");

            Log.Info(
                `download image successfully. [url=${key}, downloadPath=${downloadPath}]`
            );
        }

        return content;
    };

    if (contentImages.content) {
        problemContent.content = downloadImages(
            contentImages.content,
            problemContent.content
        );
    }

    if (contentImages.translatedContent) {
        problemContent.translatedContent = downloadImages(
            contentImages.translatedContent,
            problemContent.translatedContent
        );
    }

    const problemJsonPath = path.join(problemAssetsPath, "problem.json");
    fs.writeFileSync(problemJsonPath, JSON.stringify(problemContent), "utf-8");
    Log.Info(`download problem.json successfully. [path=${problemJsonPath}]`);

    await (async () => {
        const statementPath = (() => {
            const statementPath: Locale<string> = {};

            let key: keyof Locale<string>;
            for (key in StatementFileName) {
                statementPath[key] = path.join(
                    dst,
                    StatementFileName[key] as string
                );
            }

            return statementPath;
        })();

        (() => {
            let key: keyof Locale<string>;
            for (key in statementPath) {
                if (!statementPath[key]) {
                    continue;
                }

                if (fs.existsSync(statementPath[key] as string)) {
                    Log.Warn(
                        `${ErrorMsg.DestinationAlreadyExists}, will be removed. [dst=${statementPath[key]}`
                    );

                    fs.rmSync(statementPath[key] as string);
                }
            }
        })();

        const getProblemLink = (localeEnum?: LocaleEnum) => {
            const getBase = () => {
                switch (localeEnum) {
                    case LocaleEnum.en_US:
                        return Config.uri.us.base;
                    case LocaleEnum.zh_CN:
                        return Config.uri.cn.base;
                }
            };

            const getTitle = () => {
                switch (localeEnum) {
                    case LocaleEnum.en_US:
                        return problemContent.title;
                    case LocaleEnum.zh_CN:
                        return problemContent.translatedTitle;
                }
            };

            return `- Link: [${getTitle()}](${getBase()}problems/${
                problemContent.slug
            })`;
        };

        const getProblemDifficulty = () => {
            return `- Difficulty: ${
                ProblemDifficulty[problemContent.difficulty]
            }`;
        };

        const getProblemTag = (localeEnum?: LocaleEnum) => {
            const getTag = (t: TopicTag) => {
                switch (localeEnum) {
                    case LocaleEnum.en_US:
                        return t.name;
                    case LocaleEnum.zh_CN:
                        return t.translatedName;
                }
            };

            return `- Tag: ${problemContent.tag
                .map((t: TopicTag) => `\`${getTag(t)}\``)
                .join(" ")}`;
        };

        const getStatement = (localeEnum?: LocaleEnum) => {
            const getContent = () => {
                switch (localeEnum) {
                    case LocaleEnum.en_US:
                        return problemContent.content;
                    case LocaleEnum.zh_CN:
                        return problemContent.translatedContent;
                }
            };

            return `
??? info "Metadata"
    ${getProblemLink(localeEnum)}
    ${getProblemDifficulty()}
    ${getProblemTag(localeEnum)}

${getContent()}`;
        };

        if (problemContent.content) {
            fs.writeFileSync(
                statementPath.en_US as string,
                getStatement(LocaleEnum.en_US)
            );

            Log.Info(
                `pull statement successfully. [path=${statementPath["en_US"]}]`
            );
        }

        if (problemContent.translatedContent) {
            fs.writeFileSync(
                statementPath.zh_CN as string,
                getStatement(LocaleEnum.zh_CN)
            );

            Log.Info(
                `pull statement successfully. [path=${statementPath["zh_CN"]}]`
            );
        }
    })();
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
