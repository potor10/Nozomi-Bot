module.exports = async (client, url) => {
    const cheerio = require('cheerio');
    const got = require("got");

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Arctic Passerine Data From Units From: ${url}`);

        const findTable = '#chartable > tbody > tr > .bcell > a';

        let links = $(findTable);

        for (let i = 0; i < links.length; i++) {
            let currentLink = url + links[i].attribs.href.substring(3);

            console.log();
            await getGachaDataArctic(client, currentLink);
        }
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}