module.exports = async (data) => {
    let initUserDataObj = require('./initUserDataObj');
    let userData = await initUserDataObj();

    let initCollectionDataObj = require('./initCollectionDataObj');
    let collectionData = await initCollectionDataObj();

    let initCbid = require('./initCbidObj');
    let cbid = await initCbid();

    console.log(userData);
    console.log(collectionData);
    console.log(cbid);

    data.userData = userData;
    data.collectionData = collectionData;
    data.currentClanBattleId = cbid;
}