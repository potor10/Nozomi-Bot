module.exports = async (id) => {
    if (!(id in userData)) {
        let userStats = {
            level : 1,
            exp : 0,
            lastmessage : 0,
            jewels : 0,
            amulets : 0,
            inroll : false,
            lastclaim : 0
        }
        userData[id] = userStats;
    }
}
