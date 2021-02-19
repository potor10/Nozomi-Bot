module.exports = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();
    
    const query = `
        DROP TABLE IF EXISTS CHARDB;
    
        CREATE TABLE CHARDB (
            charname varchar NOT NULL,
            thumbnailurl varchar NOT NULL,
            fullimageurl varchar NOT NULL,
            starlevel int NOT NULL
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