import chalk from "chalk";

function Log(...text: unknown[]) {
  console.log(text);
}

function Info(...text: unknown[]) {
  console.info(`${chalk.green(text)}`);
}

function Warn(...text: unknown[]) {
  console.warn(`${chalk.yellow(text)}`);
}

function Error(...text: unknown[]) {
  console.error(`${chalk.red(text)}`);
}

export default {
  Log,
  Info,
  Warn,
  Error,
};
