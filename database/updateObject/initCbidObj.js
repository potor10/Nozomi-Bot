module.exports = async (client) => {
    let currentDate = new Date();
    let cbStart = client.config.clanbattle.cbStart;
    return (currentDate.getUTCMonth() - cbStart.getUTCMonth()) + ((currentDate.getUTCFullYear() - cbStart.getUTCFullYear()) * 12);
}