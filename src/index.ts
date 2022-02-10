#!/usr/bin/env node

import { Command } from "commander";
import Dotenv from "dotenv";
import * as Leetcode from "./leetcode";
import * as Problem from "./problem";
import * as Contest from "./contest";
import * as Mkdocs from "./mkdocs";
import path from "path";
import Log from "./log";
import * as ErrorMsg from "./errorMsg";
import { CodeTemplateFileName, SolutionFileName } from "./interface";
import { LangSlug } from "leetcode-api-typescript";
import fs from "fs";
import shell from "shelljs";
import Yaml from "js-yaml";
import { MkdocsTabTitle } from "./constant";

function addProblemProgram(program: Command) {
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

            const { slug, dst } = options;

            try {
                await Problem.Pull(slug, dst);
            } catch (err) {
                Log.Error(err);
            }
        };

        const codeAction = async () => {
            const options = codeCommand.opts();
            const { slug, dst } = options;
            let { langSlug, fileName } = options;

            try {
                if (!process.env.LEETCODE_TEMPLATE_PATH) {
                    throw new Error(
                        `${ErrorMsg.EnvironmentVariableDoesNotExist} [envName=LEETCODE_TEMPLATE_PATH]`
                    );
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
            const { slug, dst } = options;
            let { langSlug, fileName } = options;

            try {
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

        newCommand
            .option("-d, --dst <string>", "", getDefaultDst())
            .action(newAction);

        pullCommand
            .option("-s --slug <string>", "", getDefaultProblemSlug())
            .option("-d, --dst <string>", "", getDefaultDst())
            .action(pullAction);

        codeCommand
            .option("-s --slug <string>", "", getDefaultProblemSlug())
            .option("-d --dst <string>", "", getDefaultDst())
            .option("--langSlug <string>")
            .option("--fileName <string>")
            .action(codeAction);

        submitCommand
            .option("-s --slug <string>", "", getDefaultProblemSlug())
            .option("-d --dst <string>", "", getDefaultDst())
            .option("--langSlug <string>")
            .option("--fileName <string>")
            .action(submitAction);
    };

    makeProblemCommand("problem");
    makeProblemCommand("p");
}

function addContestProgram(program: Command) {
    const getDefaultDst = () => {
        return process.env.INIT_CWD as string;
    };

    const getDefaultContestType = () => {
        return process.env.INIT_CWD?.split(path.sep).slice(-1)[0] as string;
    };

    const getDefaultContestSlug = () => {
        return process.env.INIT_CWD?.split(path.sep)
            .slice(-2)
            .join("-") as string;
    };

    const makeContestCommand = (name: string) => {
        const subProgram = program.command(name);
        subProgram.description("some operations related to the contest");

        const newCommand = subProgram.command("new <id>");
        const pullCommand = subProgram.command("pull");

        const newAction = async (id: string) => {
            const options = newCommand.opts();
            const { dst, contestType } = options;

            const contestSlug = [contestType, id.toString()].join("-");

            try {
                await Contest.New(contestSlug, dst);
            } catch (err) {
                Log.Error(err);
            }
        };

        const pullAction = async () => {
            const options = pullCommand.opts();
            const { dst, contestSlug } = options;

            try {
                await Contest.Pull(contestSlug, dst);
            } catch (err) {
                Log.Error(err);
            }
        };

        newCommand
            .option("-d --dst <string>", "", getDefaultDst())
            .option("-t --contestType <string>", "", getDefaultContestType())
            .action(newAction);

        pullCommand
            .option("-d --dst <string>", "", getDefaultDst())
            .option("-s --contestSlug <string>", "", getDefaultContestSlug())
            .action(pullAction);
    };

    makeContestCommand("contest");
    makeContestCommand("c");
}

function addMkdocsProgram(program: Command) {
    const getDefaultSrc = () => {
        return path.join(process.env.INIT_CWD as string, "docs");
    };

    const getDefaultLeetcodeSrc = () => {
        return path.join(process.env.INIT_CWD as string, "leetcode");
    };

    const getDefaultDst = () => {
        return path.join(process.env.INIT_CWD as string, "_docs");
    };

    const getDefaultNavTemplateFile = () => {
        return path.join(process.env.INIT_CWD as string, "nav.template.yml");
    };

    const getDefaultConfigTemplateFile = () => {
        return path.join(process.env.INIT_CWD as string, "mkdocs.template.yml");
    };

    const getDefaultConfigDstFile = () => {
        return path.join(process.env.INIT_CWD as string, "mkdocs.yml");
    };

    const makeMkdocsCommand = (name: string) => {
        const subProgram = program.command(name);
        subProgram.description("some operations related to the markdown");

        const buildCommand = subProgram.command("build");

        const buildAction = async () => {
            const options = buildCommand.opts();
            const {
                src,
                leetcodeSrc,
                dst,
                navTemplateFile,
                configTemplateFile,
                configDstFile,
            } = options;

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

                shell.cp("-R", `${src}/*`, dst);

                let navObject: any = null;

                if (fs.existsSync(navTemplateFile)) {
                    navObject = Yaml.load(
                        fs.readFileSync(navTemplateFile, "utf8")
                    );
                } else {
                    navObject = { nav: [] };
                }

                const buildContent = async (name: string) => {
                    const docsRelativePath = name;
                    const problemSrcPath = path.join(
                        leetcodeSrc,
                        docsRelativePath
                    );
                    const problemDstPath = path.join(dst, docsRelativePath);

                    shell.cp("-R", problemSrcPath, problemDstPath);

                    navObject.nav.push({
                        [MkdocsTabTitle[name]]: await Mkdocs.Build(name)(
                            problemSrcPath,
                            problemDstPath,
                            docsRelativePath
                        ),
                    });
                };

                buildContent("problems");
                buildContent("weekly-contest");
                buildContent("biweekly-contest");

                const navYamlString = Yaml.dump(navObject);
                fs.appendFileSync(configDstFile, "\n" + navYamlString);
            } catch (err) {
                Log.Error(err);
            }
        };

        buildCommand
            .option("-s --src <string>", "", getDefaultSrc())
            .option("--leetcodeSrc <string>", "", getDefaultLeetcodeSrc())
            .option("-d --dst <string>", "", getDefaultDst())
            .option(
                "-n --navTemplateFile <string>",
                "",
                getDefaultNavTemplateFile()
            )
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
    addContestProgram(program);
    addMkdocsProgram(program);

    await program.parseAsync(process.argv);
})();
