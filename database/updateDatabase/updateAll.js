module.exports = async (client) => {
    for(let id in client.userData) {
        if (client.userData.hasOwnProperty(id)) {
            let updateStats = require('./updateStats');
            await updateStats(id, client.userData[id].level, client.userData[id].exp, client.userData[id].lastmessage, 
                client.userData[id].jewels, client.userData[id].amulets);
        }
    } 

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
                        let updateChar = require('./updateChar');
                        let currentCharData = client.gachaData[starlevel][charname];
                        await updateChar(charname, currentCharData.thumbnailurl, currentCharData.fullimageurl, starlevel, 
                            currentCharData.ubskill, currentCharData.skill1, currentCharData.skill2, currentCharData.exskill);
                    }
                }
            } 
        }
    }
}