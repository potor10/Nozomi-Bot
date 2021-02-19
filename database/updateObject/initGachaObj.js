module.exports = async (data) => {
    let initGachaDataObj = require('./initGachaDataObj');
    let gachaData = await initGachaDataObj();
    data.gachaData = gachaData;
}