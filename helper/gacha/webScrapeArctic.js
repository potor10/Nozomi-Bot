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
            console.log(links[i].attribs.href);
            //console.log(links[i].attr('href'));
            //console.log(links[i].attribs.href);
            //let getGachaDataArctic = require('./getGachaDataArctic');
            //await getGachaDataArctic(client, links[i].attr('href'));
        }
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}