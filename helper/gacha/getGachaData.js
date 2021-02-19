module.exports = async (href, thumbnailurl, findImg, characterName) => {
    try {
		const response = await got(href);
        let innerPage = cheerio.load(response.body);

        let fullimageurl = innerPage(findImg).first().attr('src');

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