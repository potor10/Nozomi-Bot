module.exports = (args, defaultValue) => {
    if (!Array.isArray(args)) return defaultValue;
    if (args.length) {
        let parseAmt = parseInt(args.shift().toLowerCase(), 10);
        if (!isNaN(parseAmt) && parseAmt >= 0) { return parseAmt; }
        else { return defaultValue; }
    } else return defaultValue;
}