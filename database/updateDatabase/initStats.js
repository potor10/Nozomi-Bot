module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS STATS;
    
        CREATE TABLE STATS (
            uid varchar NOT NULL,
            level int DEFAULT 1,
            exp int DEFAULT 0,
            lastmessage bigint DEFAULT 0,
            jewels int DEFAULT 0,
            amulets int DEFAULT 0
        );
    `

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Stats DB is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}