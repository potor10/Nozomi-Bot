module.exports = async (id, clanId) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${clanId} AND uid = '${id}';
        
        SELECT * FROM ATTACKS WHERE cbid = ${clanId} AND uid = '${id}';
    `;

    let damage = [];
    try {
        const res = await pgdb.query(query);
        console.log(`LOG: Obtained Damage Values For ${id}`);
        
        damage.push(res[0].rows[0].total);
        damage.push(res[1].rows);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return damage;
}