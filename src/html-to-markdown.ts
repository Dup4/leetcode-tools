import { NodeHtmlMarkdown } from "node-html-markdown";

const Html2Md = new NodeHtmlMarkdown(
    { keepDataImages: true },
    undefined,
    undefined
);

export default Html2Md;
