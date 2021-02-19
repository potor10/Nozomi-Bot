module.exports = async () => {
    let currentDate = new Date();
    return (currentDate.getUTCMonth() - cbStart.getUTCMonth()) + ((currentDate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
}