module.exports = async (client, href, charname, starlevel) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    const findImg = '.ie5 > table > tbody > tr > .style_td img';

    try {
		const response = await got(href);
        let $ = cheerio.load(response.body);

        let fullimages = $(findImg);

        for (let i = 0; i < fullimages.length; i++) {
            if ($(fullimages[i]).attr('title').indexOf('icon') == -1) {
                client.gachaData[starlevel + 1][charname].fullimageurl = $(fullimages[i]).attr('src');
                break;
            }
        }
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}