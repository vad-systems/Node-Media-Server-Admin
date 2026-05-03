/**
 * Converts bitrate in kbps to a human-readable format with appropriate units.
 * @param kbps Bitrate in kilobits per second
 * @returns Formatted string (e.g., "1.5 Mbps")
 */
const bitrateToSize = (kbps: number) => {
    if (kbps === 0) return '0 kbps';
    const k = 1024;
    const sizes = ['kbps', 'Mbps', 'Gbps', 'Tbps'];
    const i = Math.floor(Math.log(kbps) / Math.log(k));
    
    // Ensure we don't go out of bounds of sizes array
    const unitIndex = Math.min(i, sizes.length - 1);
    
    return parseFloat((kbps / Math.pow(k, unitIndex)).toFixed(2)) + ' ' + sizes[unitIndex];
};

export default bitrateToSize;
