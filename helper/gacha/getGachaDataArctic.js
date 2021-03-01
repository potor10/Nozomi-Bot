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

        currentChar.exskillname = skills[3].children[1].data.trim();

        let exskillstring =  $('p', skills[3]).text().trim();
        currentChar.exskill = exskillstring.substring(0, exskillstring.indexOf('\n') + 1) + 
            exskillstring.substring(exskillstring.indexOf('\n') + 1).trim();

        const stats1 = $('.splitsection > .lhalf').text().trim().split(/\n\s?/);
        const stats2 = $('.splitsection > .rhalf').text().trim().split(/\n\s?/);

        currentChar.height = stats1[1].trim().substring(stats1[1].trim().indexOf(':') + 2);
        currentChar.birthday = stats1[2].trim().substring(stats1[2].trim().indexOf(':') + 2);
        currentChar.age = stats1[3].trim().substring(stats1[3].trim().indexOf(':') + 2);
        currentChar.species = stats1[4].trim().substring(stats1[4].trim().indexOf(':') + 2);
        currentChar.guild = stats1[5].trim().substring(stats1[5].trim().indexOf(':') + 2);
        currentChar.likes = stats1[6].trim().substring(stats1[6].trim().indexOf(':') + 2);
        currentChar.cv = stats1[7].trim().substring(stats1[7].trim().indexOf(':') + 2);

        currentChar.realname = stats2[0].trim().substring(stats2[0].trim().indexOf(':') + 2);
        currentChar.weight = stats2[1].trim().substring(stats2[1].trim().indexOf(':') + 2);
        currentChar.bloodtype = stats2[2].trim().substring(stats2[2].trim().indexOf(':') + 2);

    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
}