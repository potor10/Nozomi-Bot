module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM STATS`;

    let output = {};
    let userArr;

    try {
        const res = await pgdb.query(query);
        console.log(res);
        userArr = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let user in userArr) {
        if (userArr.hasOwnProperty(user)) {
            let objectKey = userArr[user].uid;
            console.log("oKE!!!" + objectKey);

            const userStats = {
                level : userArr[user].level,
                exp : userArr[user].exp,
                lastmessage : userArr[user].lastmessage,
                jewels : userArr[user].jewels,
                amulets : userArr[user].amulets,
                inroll : false,
                lastclaim : 0
            }

            output[objectKey] = userStats;
        }
    }

    console.log(output);

    return output
}
