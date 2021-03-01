module.exports = async (client, href, charname, starlevel) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    const findImg = '.ie5 > table > tbody > tr > td > .style_td img';

    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullimages = innerPage(findImg);

        console.log(fullimages);
        for (let image in fullimages) {
            console.log(fullimages[image]);
            if (fullimages[image].attr('title').indexOf('icon') == -1) {
                client.gachaData[starlevel + 1][charname].fullimageurl = fullimages[image].attr('src');
                break;
            }
        }
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}