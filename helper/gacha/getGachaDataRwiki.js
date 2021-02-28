module.exports = async (href, thumbnailurl, findImg, characterName) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullimageurl = innerPage(findImg).filter(() => {
            return this.rowspan == 11;
          }).first().has('.style_td img').attr('src');

        console.log(fullimageurl);
        // .style_td img
        
        let characterInfo = {
            name: characterName,
            thumbnailurl: thumbnailurl,
            fullimageurl: fullimageurl
        } 

        return characterInfo;
    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}