module.exports = async (client) => {
    let initUserDataObj = require('./initUserDataObj');
    let userData = await initUserDataObj();

    let initCollectionDataObj = require('./initCollectionDataObj');
    let collectionData = await initCollectionDataObj();

    let initCbid = require('./initCbidObj');
    let cbid = await initCbid(client);

    console.log(userData);
    console.log(collectionData);
    console.log(cbid);

    client.userData = userData;
    client.collectionData = collectionData
    client.currentClanBattleId = cbid;
}