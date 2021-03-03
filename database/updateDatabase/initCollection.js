module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS COLLECTION;
    
        CREATE TABLE COLLECTION (
            uid varchar NOT NULL,
            charname varchar NOT NULL,
            starlevel int NOT NULL
        );
    `

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Collection DB is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}