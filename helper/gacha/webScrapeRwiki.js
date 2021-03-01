module.exports = async (url, findTable, findImg) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    let returnArray = [];

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

                let getGachaData = require('./getGachaDataRwiki');
                let characterInfo = await getGachaData(rows[i].attribs.href, thumbnailurl, findImg, characterName);
                returnArray.push(characterInfo);
            }
        }

        return returnArray;
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}