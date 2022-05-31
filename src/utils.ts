export function Sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function GetIdx(ix: number): string {
  if (ix === 0) {
    return "";
  }

  return ix.toString();
}

export function EscapeStatement(statement: string): string {
  return statement
    .replace(/<pre>/g, "<pre><code>")
    .replace(/<pre><code>\n/g, "<pre><code>")
    .replace(/<\/pre>/g, "</code></pre>")
    .replace(/\*/g, "\\*")
    .replace(/\$/g, "\\$");
}
