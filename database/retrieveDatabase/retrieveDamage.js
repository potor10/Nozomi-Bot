module.exports = async (client, id, date) => {
    // Initialize PG SQL DB Client
    const PGdb = require('pg').Client;
    const parseDbUrl = require("parse-database-url");
    let dbConfig = parseDbUrl(process.env["DATABASE_URL"]);
    dbConfig.ssl = { rejectUnauthorized: false };
    
    const pgdb = new PGdb(dbConfig);
    pgdb.connect();

    let getClanBattleId = require('../../helper/clanbattle/getClanBattleId');
    let currentClanBattleId = await getClanBattleId(new Date());

    const query = `
        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE cbid = ${currentClanBattleId} AND uid = '${id}';

        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE attackdate = '${date}' AND uid = '${id}';

        SELECT COALESCE((SUM(attempt1damage) + SUM(attempt2damage) + SUM(attempt3damage)), 0) as total
            FROM ATTACKS WHERE uid = '${id}';
    `;

    const values = [];
    try {
        const res = await pgdb.query(query);
        console.log(`LOG: Obtained Damage Values For ${id}`);
        
        values.push(res[0].rows[0].total);
        values.push(res[1].rows[0].total);
        values.push(res[2].rows[0].total);
    } catch (err) {
        console.log(err.stack);
    } finally {
        pgdb.end();
    }

    return values;
}