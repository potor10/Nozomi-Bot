module.exports = async (data) => {
    let gachaData = await initGachaDataObj();
    data.gachaData = gachaData;
}