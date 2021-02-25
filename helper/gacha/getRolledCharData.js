module.exports = async (client, id, rarity) => {
    const keys = Object.keys(client.gachaData[rarity]);
    const randomUnit = keys[Math.floor(Math.random() * keys.length)];
    
    const rolledThumb = client.gachaData[rarity][randomUnit].thumbnailurl;

    let isDupe = 0;
    let amulets = 0;

    if (!(id in client.collectionData)) {
        client.collectionData[id] = {};
    }

    if (randomUnit in client.collectionData[id]) {
        if (rarity == 3) {
            amulets = 50;
        } else if (rarity == 2) {
            amulets = 10;
        } else {
            amulets = 1;
        }
        isDupe = 1;
    } else {
        client.collectionData[id][randomUnit] = rarity;
    }

    let loadImage = require('./loadImage');
    const obtainedImage = await loadImage(rolledThumb);

    let outputData = [obtainedImage, isDupe, amulets]
    return outputData;
}