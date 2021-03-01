module.exports = async (client, href, charname, starlevel) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    const findImg = '.ie5 > table > tbody > tr > td';

    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullimageurl = innerPage(findImg).filter(() => {
            return this.rowspan == 11;
          });
          //.first().has('.style_td img').attr('src');

        console.log(fullimageurl);
        // .style_td img
        
        client.gachaData[starlevel + 1][charname].fullimageurl = fullimageurl
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}