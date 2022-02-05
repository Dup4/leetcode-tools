#!/usr/bin/env node

import { Command } from "commander";
import Dotenv from "dotenv";
import * as Leetcode from "./leetcode";
import * as Problem from "./problem";
import path from "path";

async function addProblemProgram(program: Command) {
    const makeProblemCommand = (name: string) => {
        const newAction = async (slug: string, dst: string) => {
            try {
                await Problem.New(slug, dst);
            } catch (err) {
                console.log(err);
            }
        };

        const pullAction = async (slug: string, dst: string) => {
            try {
                if (!slug) {
                    slug = process.env.INIT_CWD?.split(path.sep).slice(
                        -1
                    )[0] as string;
                    slug = slug.split(".").slice(-1)[0] as string;
                }

                if (!dst) {
                    dst = process.env.INIT_CWD as string;
                }

                await Problem.Pull(slug, dst);
            } catch (err) {
                console.log(err);
            }
        };

        const subProgram = program.command(name);

        subProgram.description("some operations related to the problem");
        subProgram.command("new <slug> [dst]").action(newAction);
        subProgram.command("pull [slug] [dst]").action(pullAction);
    };

    makeProblemCommand("problem");
    makeProblemCommand("p");
}

(async () => {
    Dotenv.config();
    await Leetcode.Login();

    const program = new Command();
    program.description("A cli tool to enjoy leetcode!");

    addProblemProgram(program);

    program.parse(process.argv);
})();
