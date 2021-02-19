module.exports = async (id, level, exp, lastmessage, jewels, amulets) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE STATS SET level = ${level}, exp = ${exp}, lastmessage = ${lastmessage}, jewels = ${jewels}, amulets = ${amulets}
            WHERE uid = '${id}';
        INSERT INTO STATS (uid, level, exp, lastmessage, jewels, amulets)
            SELECT '${id}', ${level}, ${exp}, ${lastmessage}, ${jewels}, ${amulets}
            WHERE NOT EXISTS (SELECT 1 FROM STATS WHERE uid = '${id}');
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: STATS table is successfully updated with values: '${id}', ${level}, ${exp}, ${jewels}, ${amulets}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}