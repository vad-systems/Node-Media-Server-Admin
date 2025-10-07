const secondsToDhmsSimple = (seconds: any)=> {
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);

    let dDisplay = d > 0 ? d + "d," : "";
    let hDisplay = h > 0 ? h + "h," : "";
    let mDisplay = m > 0 ? m + "m," : "";
    let sDisplay = s + "s";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}

export default secondsToDhmsSimple;
