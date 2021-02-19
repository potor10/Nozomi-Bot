module.exports = async (id, rarity) => {
    const keys = Object.keys(gachaData[rarity]);
    const randomUnit = keys[Math.floor(Math.random() * keys.length)];
    
    const rolledThumb = gachaData[rarity][randomUnit].thumbnailurl;

    let isDupe = 0;
    let amulets = 0;

    if (!(id in collectionData)) {
        collectionData[id] = {};
    }

    if (randomUnit in collectionData[id]) {
        if (rarity == 3) {
            amulets = 50;
        } else if (rarity == 2) {
            amulets = 10;
        } else {
            amulets = 1;
        }
        isDupe = 1;
    } else {
        collectionData[id][randomUnit] = rarity;
    }

    const obtainedImage = await loadImage(rolledThumb);

    let outputData = [obtainedImage, isDupe, amulets]
    return outputData;
}