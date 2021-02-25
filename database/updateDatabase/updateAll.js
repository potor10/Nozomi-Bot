module.exports = async (client) => {
    let collectionData = client.getCollectionData();
    for(let id in collectionData) {
        if (collectionData.hasOwnProperty(id)) {
            for(let charname in collectionData[id]) {
                if (collectionData[id].hasOwnProperty(charname)) {
                    let starlevel = collectionData[id][charname];
                    let updateCollection = require('./updateCollection');
                    await updateCollection(id, charname, starlevel);
                }
            }
        }
    }

    let isResetGacha = client.getResetGacha();
    let gachaData = client.getGachaData();
    if (isResetGacha) {
        for (let starlevel in gachaData) {
            if (gachaData.hasOwnProperty(starlevel)) {
                for(let charname in gachaData[starlevel]) {
                    if (gachaData[starlevel].hasOwnProperty(charname)) {
                        let updateCharDB = require('./updateChar');
                        await updateCharDB(charname, gachaData[starlevel][charname].thumbnailurl, gachaData[starlevel][charname].fullimageurl, starlevel);
                    }
                }
            } 
        }
    }
}