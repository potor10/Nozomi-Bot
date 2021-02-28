module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM CHARDB`;

    let gachaDataObj = {
        1 : {},
        2 : {},
        3 : {}
    };

    let charData;
    try {
        const res = await pgdb.query(query);
        charData = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let char in charData) {
        if (charData.hasOwnProperty(char)) {
            let charInfo = {
                thumbnailurl : charData[char].thumbnailurl,
                fullimageurl : charData[char].fullimageurl,
                subimageurl : charData[char].subimageurl,

                ubskillname : charData[char].ubskillname,
                ubskill : charData[char].ubskill,

                skill1name : charData[char].skill1name,
                skill1 : charData[char].skill1,

                skill2name : charData[char].skill2name,
                skill2 : charData[char].skill2,

                exskillname : charData[char].exskillname,
                exskill : charData[char].exskill,

                height : charData[char].height,
                birthday : charData[char].birthday,
                age : charData[char].age,
                species : charData[char].species,
                guild : charData[char].guild,
                likes : charData[char].likes,
                cv : charData[char].cv,
                realname : charData[char].realname,
                weight : charData[char].weight,
                bloodtype : charData[char].bloodtype
            }

            gachaDataObj[charData[char].starlevel][charData[char].charname] = charInfo;
        }
    }

    return gachaDataObj;
}
