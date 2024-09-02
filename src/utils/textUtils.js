export function sliceTextAt(text, n) {
    const sliced = text.slice(0, n);
    return sliced.concat((text.length > n) ? '...' : '');
}
