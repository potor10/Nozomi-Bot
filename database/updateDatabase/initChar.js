module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS CHARDB;
    
        CREATE TABLE CHARDB (
            charname varchar NOT NULL,

            thumbnailurl varchar NOT NULL,
            fullimageurl varchar NOT NULL,
            subimageurl varchar NOT NULL,
            starlevel int NOT NULL,

            ubskillname varchar NOT NULL,
            ubskill varchar NOT NULL,

            skill1name varchar NOT NULL,
            skill1 varchar NOT NULL,

            skill2name varchar NOT NULL,
            skill2 varchar NOT NULL,

            exskillname varchar NOT NULL,
            exskill varchar NOT NULL,

            height varchar NOT NULL,
            birthday varchar NOT NULL,
            age varchar NOT NULL,
            species varchar NOT NULL,
            guild varchar NOT NULL,
            likes varchar NOT NULL,
            cv varchar NOT NULL,
            realname varchar NOT NULL,
            weight varchar NOT NULL,
            bloodtype varchar NOT NULL
        );
    `

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Char DB is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}