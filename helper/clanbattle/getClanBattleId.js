module.exports = (date) => {
    const fs = require('fs');
    let cbDataRaw = fs.readFileSync('../../config/clanbattle.json');
    let cbData = JSON.parse(cbDataRaw);

    let cbKeys = Object.keys(cbData);
    let clanbattleId = -1;
    console.log(`CBID INIT ${clanbattleId}`);

    for (let i = 0; i < cbKeys.length; i++) {
        if (date >= new Date(cbData[cbKeys[i]].start) && date < new Date(cbData[cbKeys[i]].end)) {
            clanbattleId = cbData[cbKeys[i]].id;
        }
    }
    

    console.log(`CBID IS ${clanbattleId}`);

    return clanbattleId;
}