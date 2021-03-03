module.exports = async (id, date, attemptnum, attemptdamge) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };

    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE ATTACKS SET attempt${attemptnum}damage = ${attemptdamge}
            WHERE uid = '${id}' AND attackDate = '${date}';
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: ATTACKS table is successfully updated with attempt${attemptnum}damage = ${attemptdamge}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}