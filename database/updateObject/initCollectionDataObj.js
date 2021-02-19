module.exports = async () => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM COLLECTION`;

    let collectionData = {};

    let collectedCharData;
    try {
        const res = await pgdb.query(query);
        collectedCharData = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let collect in collectedCharData) {
        if (collectedCharData.hasOwnProperty(collect)) {
            if (!(collectedCharData[collect].uid in collectionData)) {
                collectionData[collectedCharData[collect].uid] = {};
            }
            collectionData[collectedCharData[collect].uid][collectedCharData[collect].charname] = 
                collectedCharData[collect].starlevel
        }
    }

    return collectionData;
}