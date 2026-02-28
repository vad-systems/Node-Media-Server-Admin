const bytesToSize = (bytes: number) => {
    if (bytes === 0) return '0 Byte';
    bytes = Number(bytes);
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

export default bytesToSize;
