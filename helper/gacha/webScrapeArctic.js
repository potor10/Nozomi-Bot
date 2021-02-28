module.exports = async (client, url) => {
    const cheerio = require('cheerio');
    const got = require("got");

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Arctic Passerine Data From Units From: ${url}`);
        console.log(response.body);
        const findTable = '#chartable > tbody > tr > .bcell th > a';

        let links = $(findTable);

        for (let i = 0; i < links.length; i++) {
            console.log(links.html());
            
            let charurl = links.attr('href');;

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