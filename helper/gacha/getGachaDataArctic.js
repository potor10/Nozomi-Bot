module.exports = async (client, href) => {
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

        let currentChar = client.gachaData[starlevel][charname];

        currentChar.subimage = $('#rightcolumn > img').attr('src');

        const skills = $('.splitsection .skillbox');

        currentChar.ubskillname = $('strong', skills[0]).text();
        currentChar.ubskill = $('p', skills[0]).text();

        currentChar.skill1name = $('strong', skills[1]).text();
        currentChar.skill1 = $('p', skills[1]).text();

        currentChar.skill2name = $('strong', skills[2]).text();
        currentChar.skill2 = $('p', skills[2]).text();

        currentChar.exskill = $('strong', skills[3]).text();
        currentChar.exskill = $('p', skills[3]).text();

        const stats1 = $('.splitsection > .lhalf');
        const stats2 = $('.splitsection > .rhalf');

        console.log(stats1).text();
        
        console.log(currentChar);

    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
}