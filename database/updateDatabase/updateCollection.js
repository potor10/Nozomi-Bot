module.exports = async (id, charname, starlevel) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        INSERT INTO COLLECTION (uid, charname, starlevel)
            SELECT '${id}', '${charname}', ${starlevel}
            WHERE NOT EXISTS (SELECT 1 FROM COLLECTION WHERE uid = '${id}' AND charname = '${charname}');
    `;

    try {
        const res = await pgdb.query(query);
        //console.log(`LOG: ${charname} was successfully added to ${id}'s collection`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}