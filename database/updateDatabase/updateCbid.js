= async (cbid) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        UPDATE CB 
            SET cbid = ${cbid};
    `;

    try {
        const res = await pgdb.query(query);
        console.log(`LOG: CB table is successfully updated with value ${cbid}`);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }
}