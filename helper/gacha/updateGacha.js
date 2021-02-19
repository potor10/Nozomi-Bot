module.exports = async () => {
    const urls = [];
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85');
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85');
    urls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85%E2%98%85');

    const findTable = '.table > tbody > tr > td > a';
    const findImg = '.ie5 > table > tbody > tr > .style_td img';

    const charArray = [];
    
    for (let i = 0; i < urls.length; i++) {
        charArray.push(await webScrape(urls[i], findTable, findImg));
    }

    for (let i = 0; i < charArray.length; i++) {
        for (let j = 0; j < charArray[i].length; j++) {
            gachaData[i+1][charArray[i][j].name] = { 
                thumbnailurl : charArray[i][j].thumbnailurl, 
                fullimageurl : charArray[i][j].fullimageurl
            };
        }
    }   
}