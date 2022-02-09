import { Problem, LangSlug } from "leetcode-api-typescript";
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
    const problemPath = path.join(dst, "problem");
    if (fs.existsSync(problemPath)) {
        Log.Warn(
            `${ErrorMsg.DestinationAlreadyExists}, will be removed. [dst=${problemPath}]`
        );

        fs.rmSync(problemPath, { recursive: true });
    }

    fs.mkdirSync(problemPath, { recursive: true });

    const problemContent = JSON.parse(JSON.stringify(problem));
    const contentImages = await problem.getContentImages();

    const downloadImages = (mp: Map<string, string>, content: string) => {
        for (const key of mp.keys()) {
            const replaceKey = key.replace(/\//g, "-");

            content = content.replace(
                key,
                path.join("./", "problem", replaceKey)
            );

            const downloadPath = path.join(problemPath, replaceKey);
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

    const problemJsonPath = path.join(problemPath, "problem.json");

    fs.writeFileSync(problemJsonPath, JSON.stringify(problemContent), "utf-8");

    Log.Info(`download problem.json successfully. [path=${problemJsonPath}]`);
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
