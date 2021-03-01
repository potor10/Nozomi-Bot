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
                let characterName = imgTitle.substr(idxName + 1);

                let characterKeys = Object.keys(client.gachaData[starlevel + 1]);
                const matchingKeys = characterKeys.filter(key => key.split(/,\s?/)[1] == characterName);

                if(matchingKeys.length != 0) {
                    client.gachaData[starlevel + 1][matchingKeys[0]].thumbnailurl = thumbnailurl;

                    let getGachaDataRwiki = require('./getGachaDataRwiki');
                    await getGachaDataRwiki(client, rows[i].attribs.href, matchingKeys[0], starlevel);
                }
            }
        }
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}