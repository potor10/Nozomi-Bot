module.exports = async (client) => {

    const arcticurl = 'https://priconne.arcticpasserine.com/characters/';

    let webScrapeData = require('./webScrapeArctic'); 
    await webScrapeData(client, arcticurl);
    
    const rwikiurls = [];
    rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85');
    rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85');
    rwikiurls.push('https://rwiki.jp/priconne_redive/%E3%82%AD%E3%83%A3%E3%83%A9/%E2%98%85%E2%98%85%E2%98%85');


    for (let i = 0; i < rwikiurls.length; i++) {
        let webScrapeImages = require('./webScrapeRwiki'); 
        await webScrapeImages(client, i, rwikiurls[i]);
    }
    
    console.log(client.gachaData);
}