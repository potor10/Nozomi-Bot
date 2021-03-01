module.exports = async (charname, starlevel, char) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    console.log(`LOG: Adding ${charname} To The Database`);

    const query = `
        UPDATE CHARDB SET 
            thumbnailurl = '${char.thumbnailurl}', fullimageurl = '${char.fullimageurl}', subimageurl = '${char.subimageurl}', 
            starlevel = ${starlevel}, 
            ubskillname = '${char.ubskillname.replace(/'/gi, '\'\'')}', ubskill = '${char.ubskill.replace(/'/gi, '\'\'')}', 
            skill1name = '${char.skill1name.replace(/'/gi, '\'\'')}', skill1 = '${char.skill1.replace(/'/gi, '\'\'')}', 
            skill2name =' ${char.skill2name.replace(/'/gi, '\'\'')}', skill2 = '${char.skill2.replace(/'/gi, '\'\'')}', 
            exskillname = '${char.exskillname.replace(/'/gi, '\'\'')}', exskill = '${char.exskill.replace(/'/gi, '\'\'')}',
            height = '${char.height}', birthday = '${char.birthday}', age = '${char.age}', species = '${char.species}', guild = '${char.guild}',
            likes = '${char.likes.replace(/'/gi, '\'\'')}', 
            cv = '${char.cv}', realname = '${char.realname}', weight = '${char.weight}', bloodtype = '${char.bloodtype}'
            WHERE charname = '${charname}';

        INSERT INTO CHARDB (charname, thumbnailurl, fullimageurl, subimageurl, starlevel, 
            ubskillname, ubskill, skill1name, skill1, skill2name, skill2, exskillname, exskill,
            height, birthday, age, species, guild, likes, cv, realname, weight, bloodtype)
            SELECT '${charname}', '${char.thumbnailurl}', '${char.fullimageurl}', '${char.subimageurl}', ${starlevel}, 
                '${char.ubskillname.replace(/'/gi, '\'\'')}', '${char.ubskill.replace(/'/gi, '\'\'')}', 
                '${char.skill1name.replace(/'/gi, '\'\'')}', '${char.skill1.replace(/'/gi, '\'\'')}', 
                '${char.skill2name.replace(/'/gi, '\'\'')}', '${char.skill2.replace(/'/gi, '\'\'')}', 
                '${char.exskillname.replace(/'/gi, '\'\'')}', '${char.exskill.replace(/'/gi, '\'\'')}',
                '${char.height}', '${char.birthday}', '${char.age}', '${char.species}', '${char.guild}', 
                '${char.likes.replace(/'/gi, '\'\'')}', 
                '${char.cv}', '${char.realname}', '${char.weight}', '${char.bloodtype}' 
            WHERE NOT EXISTS (SELECT 1 FROM CHARDB WHERE charname = '${charname}');
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}