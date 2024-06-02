function calculateChecksum(bytes: number[]): number {
    let summ = 0;
    bytes.forEach((item) => (summ += item));
    return summ & 255;
}
