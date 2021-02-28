module.exports = async (client) => {

    const arcticurl = 'https://priconne.arcticpasserine.com/characters/';

    let webScrapeData = require('./webScrapeArctic'); 
    await webScrapeData(client, arcticurl);
    
    const rwikiurls = [];
    //rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85');
    //rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85');
    //rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85%E2%98%85');

    const findTableRwiki = '.table > tbody > tr > td > a';
    const findImgRwiki = '.ie5 > table > tbody > tr > td';

    for (let i = 0; i < rwikiurls.length; i++) {
        let webScrapeImages = require('./webScrapeRwiki'); 
        charArray.push(await webScrapeImages(rwikiurls[i], findTableRwiki, findImgRwiki));
    }

    for (let i = 0; i < charArray.length; i++) {
        for (let j = 0; j < charArray[i].length; j++) {
            client.gachaData[i+1][charArray[i][j].name] = { 
                thumbnailurl : charArray[i][j].thumbnailurl, 
                fullimageurl : charArray[i][j].fullimageurl
            };
        }
    }   
}