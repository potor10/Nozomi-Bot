module.exports = async (client) => {
    let initUserDataObj = require('./initUserDataObj');
    client.userData = await initUserDataObj();

    let initCollectionDataObj = require('./initCollectionDataObj');
    client.collectionData = await initCollectionDataObj();

    let initCbid = require('./initCbidObj');
    client.currentClanBattleId = await initCbid(client);
}