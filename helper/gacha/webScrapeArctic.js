module.exports = async (client, url) => {
    const cheerio = require('cheerio');
    const got = require("got");

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Arctic Passerine Data From Units From: ${url}`);

        const findTable = '#chartable > tbody > tr';

        let rows = $(findTable);

        for (let i = 0; i < rows.length; i++) {
            let bcells = $('.bcell th', rows[i]);
            
            let charurl = $('a', bcells.first());
            console.log(charurl);

            if (charurl) {
                let getGachaDataArctic = require('./getGachaDataArctic');
                await getGachaDataArctic(client, charurl);
            }
            
        }
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}