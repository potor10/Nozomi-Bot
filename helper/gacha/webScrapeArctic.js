module.exports = async (client, url) => {
    const cheerio = require('cheerio');
    const got = require("got");

    try {
        const response = await got(url);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Arctic Passerine Data From Units From: ${url}`);

        const findTable = '#chartable > tbody > tr > .bcell > a';
        const findTempThumb = '#chartable > tbody > tr > .imgcell > a';

        let links = $(findTable);
        let thumbs = $(findTempThumb);

        //links.length
        for (let i = 0; i < 2; i++) {
            let currentLink = url + links[i].attribs.href.substring(14);
            let thumbnailurl = url.substring(0, url.length - 12) + $('img', thumbs[i]).attr('src').substring(2);

            console.log(currentLink);
            let getGachaDataArctic = require('./getGachaDataArctic');
            await getGachaDataArctic(client, currentLink, thumbnailurl);
        }
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}