module.exports = async (client, id) => {
    if (!(id in client.userData)) {
        let userStats = {
            level : 1,
            exp : 0,
            lastmessage : 0,
            jewels : 0,
            amulets : 0,
            inroll : false,
            lastclaim : 0
        }
        client.userData[id] = userStats;
    }
}
