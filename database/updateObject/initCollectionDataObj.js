module.exports = async () => {
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