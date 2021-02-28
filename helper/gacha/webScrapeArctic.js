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
            let bcells = $('.bcell th > a', rows[i]);
            
            let charurl = bcells;
            console.log(bcells);

            /*
            if (charurl) {
                let getGachaDataArctic = require('./getGachaDataArctic');
                await getGachaDataArctic(client, charurl);
            }
            */
            
        }
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}