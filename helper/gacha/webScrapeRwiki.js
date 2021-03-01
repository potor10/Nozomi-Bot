module.exports = async (client, starlevel, url) => {
    const cheerio = require('cheerio');
    const got = require("got");

    const findTable = '.table > tbody > tr > td > a';

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Data From Units From: ${url}`);

        let firstClass = $('.ie5').first().html();
        $ = cheerio.load(firstClass);

        let rows = $(findTable);

        for (let i = 0; i < rows.length; i++) {
            let imgTitle = $('img', rows[i]).attr('title');
            let idxName = imgTitle.lastIndexOf('★');

            if (idxName != -1) {
                let thumbnailurl = $('img', rows[i]).attr('src');
                let characterName = imgTitle.substr(idxName + 1).replace(/\s/g, '');

                let foundCharacter = false;
                for (let j = 0; j < 3; j++) {
                    let characterKeys = Object.keys(client.gachaData[j + 1]);
                    for (let k = 0; k < characterKeys.length; k++) {
                        if (characterKeys[k].split(/,\s?/)[1] == characterName) {
                            // Check for incongruities;
                            if (j != starlevel) {
                                console.log(`LOG: Inconsistency found in star level w/ ${characterKeys[k]}`);
                                client.gachaData[starlevel + 1][characterKeys[k]] = client.gachaData[j + 1][characterKeys[k]];
                                
                                delete client.gachaData[j + 1][characterKeys[k]];
                            }

                            client.gachaData[starlevel + 1][characterKeys[k]].thumbnailurl = thumbnailurl;

                            let loadImage = require('../../helper/gacha/loadImage');
                            console.log(`LOG: Loading Image ${thumbnailurl} Into Memory`);
                            const obtainedImage = await loadImage(thumbnailurl);

                            client.gachaData[starlevel + 1][characterKeys[k]].loadedimage = obtainedImage;

                            let getGachaDataRwiki = require('./getGachaDataRwiki');
                            await getGachaDataRwiki(client, rows[i].attribs.href, characterKeys[k], starlevel);

                            foundCharacter = true;
                            break;
                        }
                    }
    
                    if(foundCharacter) {
                        break;
                    }
                }


            }
        }
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}