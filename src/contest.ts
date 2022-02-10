import { Contest, Problem } from "leetcode-api-typescript";
import * as ProblemUtils from "./problem";
import path from "path";
import fs from "fs";

export async function New(slug: string, dst: string) {
    const contest = await Contest.build(slug);
    const problems = await contest.getProblems();

    dst = path.join(dst, String(slug.split("-").slice(-1)[0]));
    fs.mkdirSync(dst, { recursive: true });

    DownloadProblem(problems, dst);
}

export async function Pull(slug: string, dst: string) {
    const contest = await Contest.build(slug);
    const problems = await contest.getProblems();

    DownloadProblem(problems, dst);
}

export async function DownloadProblem(problems: Array<Problem>, dst: string) {
    for (const ix in problems) {
        const pId = String.fromCharCode("a".charCodeAt(0) + Number(ix));
        const p = problems[ix];

        const targetDir = path.join(dst, pId);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir);
        }

        ProblemUtils.DownloadProblem(p, targetDir);
    }
}
