/* Checks if a certain string is blank */
export function isBlank(str : string) {
    return !str || str.trim().length === 0
}

/* Returns all usable code lines from a program text from the raw program source code*/
export function getCodeLines(programText : string) {
    if(isBlank(programText)) return [];

    const rawLines = programText.split("\n");
    return rawLines.map(getCodeFromLine).filter((l) => !isBlank(l))
}

/* Converts operands to their desired format while also checking their range */
export function operand8Bits(op : number) {
    if(op > 127 || op < -128) throw new Error("Operand not in range");
    return op & 0xFF; // last 8 bits
}

export function getBits(value : number, nBits : number, from : number) {
    const mask : number = ~(~0 << nBits);
    return (value >> from) & mask;
}

/* Applies sign extension to an 8-bit number */
export function signExtend8(value: number): number {
    return value & 0x80 ? value - 0x100 : value;
}

/* Returns the text in a given line that is not a comment*/
export function getCodeFromLine(line : string) {
    return line.split("#")[0].trim();
}