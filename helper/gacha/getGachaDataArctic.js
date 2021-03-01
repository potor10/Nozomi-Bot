module.exports = async (client, href, thumbnailurl) => {
    const cheerio = require('cheerio');
    const got = require("got");
    
    try {
        const response = await got(href);
        let $ = cheerio.load(response.body);
        console.log(`LOG: Finding Arctic Passerine Data From Units From: ${href}`);

        const encharname = $('.ltext > h1').text();
        const jpcharname = $('.rtext > h1').text();
        
        const charname = `${encharname}, ${jpcharname}`;

        const starlevel = ($('.ltext > .centeredbox').text().match(/★/g) || []).length;

        client.gachaData[starlevel][charname] = {};
        let currentChar = client.gachaData[starlevel][charname];

        currentChar.thumbnailurl = thumbnailurl;
        currentChar.fullimageurl = thumbnailurl;

        currentChar.subimage = href + $('#rightcolumn > img').attr('src');

        const skills = $('.splitsection .skillbox');

        currentChar.ubskillname = skills[0].children[1].data.trim();
        currentChar.ubskill = $('p', skills[0]).text().trim();

        currentChar.skill1name = skills[1].children[1].data.trim();
        currentChar.skill1 = $('p', skills[1]).text().trim();

        currentChar.skill2name = skills[2].children[1].data.trim();
        currentChar.skill2 = $('p', skills[2]).text().trim();

        currentChar.exskill = skills[3].children[1].data.trim();
        currentChar.exskill = $('p', skills[3]).text().trim();

        const stats1 = $('.splitsection > .lhalf');
        const stats2 = $('.splitsection > .rhalf');

        console.log(stats1[0].children);

        currentChar.height = stats1.children[1].data.trim();
        currentChar.birthday = stats1.children[4].data.trim();
        
        console.log(currentChar);

    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}