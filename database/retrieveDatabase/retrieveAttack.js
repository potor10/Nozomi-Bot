module.exports = async (id, date) => {
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `SELECT * FROM ATTACKS WHERE attackdate = '${date}' AND uid = '${id}'`;

    let output = {};
    try {
        const res = await pgdb.query(query);
        console.log(`LOG: Obtained Attacks For ${id}`);
        if (res.rows.length > 0) {
            output = res.rows[0];
        } else {
            output.attempt1damage = 0;
            output.attempt2damage = 0;
            output.attempt3damage = 0;
        }
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return output;
}
