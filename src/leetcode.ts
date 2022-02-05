import Leetcode, { EndPoint } from "leetcode-api-typescript";

export async function Login() {
    const props = (() => {
        if (process.env?.LEETCODE_COOKIE) {
            return {
                cookie: process.env.LEETCODE_COOKIE,
            };
        } else {
            return {
                username: process.env.LEETCODE_USERNAME || "",
                password: process.env.LEETCODE_PASSWORD || "",
            };
        }
    })();

    await Leetcode.build(
        process.env.LEETCODE_ENDPOINT === "CN" ? EndPoint.CN : EndPoint.US,
        props
    );
}
