module.exports = async () => {
    for(let id in collectionData) {
        if (collectionData.hasOwnProperty(id)) {
            for(let charname in collectionData[id]) {
                if (collectionData[id].hasOwnProperty(charname)) {
                    let starlevel = collectionData[id][charname];
                    await updateCollection(id, charname, starlevel);
                }
            }
        }
    }

    if (isResetGacha) {
        for (let starlevel in gachaData) {
            if (gachaData.hasOwnProperty(starlevel)) {
                for(let charname in gachaData[starlevel]) {
                    if (gachaData[starlevel].hasOwnProperty(charname)) {
                        await updateCharDB(charname, gachaData[starlevel][charname].thumbnailurl, gachaData[starlevel][charname].fullimageurl, starlevel);
                    }
                }
            } 
        }
    }
}