module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS ATTACKS;
    
        CREATE TABLE ATTACKS (
            uid varchar NOT NULL,
            attackdate date NOT NULL,
            attempt1damage int DEFAULT 0,
            attempt2damage int DEFAULT 0,
            attempt3damage int DEFAULT 0,
            attempt4damage int DEFAULT 0,
            cbid int NOT NULL
        );
    `

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Attacks DB is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}