export function Sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

export function GetIdx(ix: number): string {
    if (ix === 0) {
        return "";
    }

    return ix.toString();
}
