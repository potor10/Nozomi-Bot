module.exports = async (client) => {
    for(let id in client.collectionData) {
        if (client.collectionData.hasOwnProperty(id)) {
            for(let charname in client.collectionData[id]) {
                if (client.collectionData[id].hasOwnProperty(charname)) {
                    let starlevel = client.collectionData[id][charname];
                    let updateCollection = require('./updateCollection');
                    await updateCollection(id, charname, starlevel);
                }
            }
        }
    }

    if (client.isResetGacha) {
        for (let starlevel in client.gachaData) {
            if (client.gachaData.hasOwnProperty(starlevel)) {
                for(let charname in client.gachaData[starlevel]) {
                    if (client.gachaData[starlevel].hasOwnProperty(charname)) {
                        let updateCharDB = require('./updateChar');
                        await updateCharDB(charname, gachaData[starlevel][charname].thumbnailurl, gachaData[starlevel][charname].fullimageurl, starlevel);
                    }
                }
            } 
        }
    }
}