#!/usr/bin/env node

import { Command } from "commander";
import Dotenv from "dotenv";
import * as Leetcode from "./leetcode";
import * as Problem from "./problem";
import * as Mkdocs from "./mkdocs";
import path from "path";
import Log from "./log";
import * as ErrorMsg from "./errorMsg";
import { CodeTemplateFileName, SolutionFileName } from "./interface";
import { LangSlug } from "leetcode-api-typescript";
import fs from "fs";
import shell from "shelljs";
import Yaml from "js-yaml";

async function addProblemProgram(program: Command) {
    const getDefaultProblemSlug = () => {
        let slug;
        slug = process.env.INIT_CWD?.split(path.sep).slice(-1)[0] as string;
        slug = slug.split(".").slice(-1)[0] as string;

        return slug;
    };

    const getDefaultDst = () => {
        return process.env.INIT_CWD as string;
    };

    const getDefaultLangSlug = () => {
        return LangSlug.cpp;
    };

    const makeProblemCommand = (name: string) => {
        const subProgram = program.command(name);
        subProgram.description("some operations related to the problem");

        const newCommand = subProgram.command("new <slug>");
        const pullCommand = subProgram.command("pull");
        const codeCommand = subProgram.command("code");
        const submitCommand = subProgram.command("submit");

        const newAction = async (slug: string) => {
            const options = newCommand.opts();
            const { dst } = options;

            try {
                await Problem.New(slug, dst);
            } catch (err) {
                Log.Error(err);
            }
        };

        const pullAction = async () => {
            const options = pullCommand.opts();

            let { slug, dst } = options;

            try {
                if (!slug) {
                    slug = getDefaultProblemSlug();
                }

                if (!dst) {
                    dst = getDefaultDst();
                }

                await Problem.Pull(slug, dst);
            } catch (err) {
                Log.Error(err);
            }
        };

        const codeAction = async () => {
            const options = codeCommand.opts();
            let { slug, dst, langSlug, fileName } = options;

            try {
                if (!process.env.LEETCODE_TEMPLATE_PATH) {
                    throw new Error(
                        `${ErrorMsg.EnvironmentVariableDoesNotExist} [envName=LEETCODE_TEMPLATE_PATH]`
                    );
                }

                if (!slug) {
                    slug = getDefaultProblemSlug();
                }

                if (!dst) {
                    dst = getDefaultDst();
                }

                if (!langSlug) {
                    langSlug = getDefaultLangSlug();
                } else {
                    langSlug = LangSlug[langSlug];
                }

                fileName = SolutionFileName(langSlug, fileName);

                const codeTemplateFileName = CodeTemplateFileName(langSlug);
                const templateContent = fs
                    .readFileSync(
                        path.join(
                            process.env.LEETCODE_TEMPLATE_PATH,
                            codeTemplateFileName
                        )
                    )
                    .toString();

                await Problem.Code(
                    slug,
                    langSlug,
                    templateContent,
                    path.join(dst, fileName)
                );
            } catch (err) {
                Log.Error(err);
            }
        };

        const submitAction = async () => {
            const options = submitCommand.opts();
            let { slug, dst, langSlug, fileName } = options;

            try {
                if (!slug) {
                    slug = getDefaultProblemSlug();
                }

                if (!dst) {
                    dst = getDefaultDst();
                }

                if (!langSlug) {
                    langSlug = getDefaultLangSlug();
                } else {
                    langSlug = LangSlug[langSlug];
                }

                fileName = SolutionFileName(langSlug, fileName);
                const codePath = path.join(dst, fileName);

                Log.Info(`codePath: ${codePath}`);

                const code = fs.readFileSync(codePath).toString();

                await Problem.Submit(slug, langSlug, code);
            } catch (err) {
                console.log(err);
            }
        };

        newCommand.option("-d, --dst <string>").action(newAction);

        pullCommand
            .option("-s --slug <string>")
            .option("-d, --dst <string>")
            .action(pullAction);

        codeCommand
            .option("-s --slug <string>")
            .option("-d --dst <string>")
            .option("--langSlug <string>")
            .option("--fileName <string>")
            .action(codeAction);

        submitCommand
            .option("-s --slug <string>")
            .option("-d --dst <string>")
            .option("--langSlug <string>")
            .option("--fileName <string>")
            .action(submitAction);
    };

    makeProblemCommand("problem");
    makeProblemCommand("p");
}

async function addMkdocsProgram(program: Command) {
    const getDefaultSrc = () => {
        return path.join(process.env.INIT_CWD ?? "", "leetcode");
    };

    const getDefaultDst = () => {
        return path.join(process.env.INIT_CWD ?? "", "docs");
    };

    const getDefaultConfigTemplateFile = () => {
        return path.join(process.env.INIT_CWD ?? "", "mkdocs.template.yml");
    };

    const getDefaultConfigDstFile = () => {
        return path.join(process.env.INIT_CWD ?? "", "mkdocs.yml");
    };

    const makeMkdocsCommand = (name: string) => {
        const subProgram = program.command(name);
        subProgram.description("some operations related to the markdown");

        const buildCommand = subProgram.command("build");

        const buildAction = async () => {
            const options = buildCommand.opts();
            const { src, dst, configTemplateFile, configDstFile } = options;

            try {
                if (!fs.existsSync(configTemplateFile)) {
                    throw new Error(
                        `${ErrorMsg.FileDoesNotExist}. [file=${configTemplateFile}]`
                    );
                }

                if (fs.existsSync(dst)) {
                    fs.rmSync(dst, { recursive: true });
                }

                fs.mkdirSync(dst, { recursive: true });
                fs.copyFileSync(configTemplateFile, configDstFile);

                const navObject: { nav: any } = { nav: [] };

                {
                    const problemSrcPath = path.join(src, "problem");
                    const problemDstPath = path.join(dst, "problem");

                    fs.mkdirSync(dst);

                    navObject.nav.push({
                        Problem: await Mkdocs.Build(
                            problemSrcPath,
                            problemDstPath,
                            "problem"
                        ),
                    });
                }

                const navYamlString = Yaml.dump(navObject);
                fs.appendFileSync(configDstFile, "\n" + navYamlString);
            } catch (err) {
                Log.Error(err);
            }
        };

        buildCommand
            .option("-s --src <string>", "", getDefaultSrc())
            .option("-d --dst <string>", "", getDefaultDst())
            .option(
                "--configTemplateFile <string>",
                "",
                getDefaultConfigTemplateFile()
            )
            .option("--configDstFile <string>", "", getDefaultConfigDstFile())
            .action(buildAction);
    };

    makeMkdocsCommand("mkdocs");
    makeMkdocsCommand("md");
}

(async () => {
    Dotenv.config();
    await Leetcode.Login();

    const program = new Command();
    program.description("A cli tool to enjoy leetcode!");

    addProblemProgram(program);
    addMkdocsProgram(program);

    await program.parseAsync(process.argv);
})();
