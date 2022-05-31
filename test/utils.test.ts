import { describe, expect, it } from "vitest";
import { EscapeStatement } from "../src/utils";

describe("EscapeStatement", () => {
  it("empty content", () => {
    expect(EscapeStatement("")).toEqual("");
  });

  it("contain $", () => {
    expect(EscapeStatement("$")).toMatchInlineSnapshot('"\\\\$"');

    const content = `
    <ul>
      <li>例如 <code>"$100"</code>、<code>"$23"</code> 和 <code>"$6.75"</code> 表示价格，而 <code>"100"</code>、<code>"$"</code> 和 <code>"2$3"</code> 不是。</li>
    </ul>
  `;

    expect(content).toMatchInlineSnapshot(`
      "
          <ul>
            <li>例如 <code>\\"\$100\\"</code>、<code>\\"\$23\\"</code> 和 <code>\\"\$6.75\\"</code> 表示价格，而 <code>\\"100\\"</code>、<code>\\"\$\\"</code> 和 <code>\\"2\$3\\"</code> 不是。</li>
          </ul>
        "
    `);

    expect(EscapeStatement(content)).toMatchInlineSnapshot(`
      "
          <ul>
            <li>例如 <code>\\"\\\\\$100\\"</code>、<code>\\"\\\\\$23\\"</code> 和 <code>\\"\\\\\$6.75\\"</code> 表示价格，而 <code>\\"100\\"</code>、<code>\\"\\\\\$\\"</code> 和 <code>\\"2\\\\\$3\\"</code> 不是。</li>
          </ul>
        "
    `);
  });
});
