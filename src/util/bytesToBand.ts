const bytesToBand = (bytes: number) => {
    if (bytes === 0) {
        return 0;
    }
    let bits = Number(bytes) * 8;
    return Math.round(bits / Math.pow(1024, 2));
};

export default bytesToBand;
