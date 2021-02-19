module.exports = async (data) => {
    let initUserDataObj = require('./initUserDataObj');
    let userData = await initUserDataObj();

    let initCollectionDataObj = require('./initCollectionDataObj');
    let collectionData = await initCollectionDataObj();

    let initCbid = require('./initCbid');
    let cbid = await initCbid();

    data.userData = userData;
    data.collectionData = collectionData;
    data.currentClanBattleId = cbid;
}