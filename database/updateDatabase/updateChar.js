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
        UPDATE CHARDB SET thumbnailurl = '${char.thumbnailurl}', fullimageurl = '${char.fullimageurl}', subimageurl = '${char.subimageurl}', 
            starlevel = ${starlevel}, 
            ubskillname = ${char.ubskillname}, ubskill = ${char.ubskill}, skill1name = ${char.skill1name}, skill1 = ${char.skill1}, 
            skill2name = ${char.skill2name}, skill2 = ${char.skill2}, exskillname = ${char.exskillname}, exskill = ${char.exskill},
            height = ${char.height}, birthday = ${char.birthday}, age = ${char.age}, species = ${char.species}, guild = ${char.guild},
            likes = ${char.likes}, cv = ${char.cv}, realname = ${char.realname}, weight = ${char.weight}, bloodtype = ${char.bloodtype}
            WHERE charname = '${char.charname}';

        INSERT INTO CHARDB (charname, thumbnailurl, fullimageurl, subimageurl, starlevel, 
            ubskillname, ubskill, skill1name, skill1, skill2name, skill2, exskillname, exskill,
            height, birthday, age, species, guild, likes, cv, realname, weight, bloodtype)
            SELECT '${char.charname}', '${char.thumbnailurl}', '${char.fullimageurl}', '${char.subimageurl}', ${starlevel}, 
                '${char.ubskillname}', '${char.ubskill}', '${char.skill1name}', '${char.skill1}', 
                '${char.skill2name}', '${char.skill2}', '${char.exskillname}', '${char.exskill}',
                '${char.height}', '${char.birthday}', '${char.age}', '${char.species}', '${char.guild}', 
                '${char.likes}', '${char.cv}', '${char.realname}', '${char.weight}', '${char.bloodtype}' 
            WHERE NOT EXISTS (SELECT 1 FROM CHARDB WHERE charname = '${char.charname}');
    `;

    try {
        const res = await pgdb.query(query);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}