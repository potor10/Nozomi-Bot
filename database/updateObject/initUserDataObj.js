module.exports = async () => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM STATS`;

    let output = {};
    let userArr;

    try {
        const res = await pgdb.query(query);
        userArr = res.rows;
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    for (let user in userArr) {
        if (userArr.hasOwnProperty(user)) {
            let objectKey = userArr[user].uid;

            const userStats = {
                level : userArr[user].level,
                exp : userArr[user].exp,
                lastmessage : userArr[user].lastmessage,
                jewels : userArr[user].jewels,
                amulets : userArr[user].amulets,
                inroll : false,
                lastclaim : 0
            }

            output[objectKey] = userStats;
        }
    }

    return output
}
