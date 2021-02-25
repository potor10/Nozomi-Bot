module.exports = async (client) => {
    let initGachaDataObj = require('./initGachaDataObj');
    let gachaData = await initGachaDataObj();
    client.gachaData = gachaData;
}