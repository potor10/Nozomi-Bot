module.exports = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        DROP TABLE IF EXISTS ATTACKS;
        DROP TABLE IF EXISTS STATS;
        DROP TABLE IF EXISTS COLLECTION;
        DROP TABLE IF EXISTS CB;

        CREATE TABLE ATTACKS (
            uid varchar NOT NULL,
            attackdate date NOT NULL,
            attempt1damage int DEFAULT 0,
            attempt2damage int DEFAULT 0,
            attempt3damage int DEFAULT 0,
            cbid int NOT NULL
        );

        CREATE TABLE STATS (
            uid varchar NOT NULL,
            level int DEFAULT 1,
            exp int DEFAULT 0,
            lastmessage bigint DEFAULT 0,
            jewels int DEFAULT 0,
            amulets int DEFAULT 0
        );

        CREATE TABLE COLLECTION (
            uid varchar NOT NULL,
            charname varchar NOT NULL,
            starlevel int NOT NULL
        );

        CREATE TABLE CB (
            cbid int DEFAULT 0
        );

        INSERT INTO CB (cbid)
            VALUES (0);
    `;

    try {
        const res = await pgdb.query(query);
        console.log('LOG: Table is successfully reset');
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}