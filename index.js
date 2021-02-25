/**
 * @description Rad Dream Bot
 * @author Potor10 
 * @summary An Autistic Discord Bot For Princess Connect
 */

// Objects Used To Store Realtime Changes - Obtained Once On Startup

//const { Client, Attachment, MessageEmbed } = require("discord.js");

const discord = require('discord.js');

const { Player } = require('discord-player');
const fs = require('fs');

// Initialize Discord Client
class nozomiBot extends discord.Client {
    userData = {};
    gachaData = {};
    collectionData = {};
    currentClanBattleId = 0;
    isResetGacha = false;

    updateAll = (userData, collectionData, currentClanBattleId) => {
        this.userData = userData;
        this.collectionData = collectionData;
        this.currentClanBattleId = currentClanBattleId;
    }

    getUserData = () => {
        return this.userData;
    }

    getCollectionData = () => {
        return this.collectionData;
    }

    getCurrentClanBattleId = () => {
        return this.currentClanBattleId;
    }

    updateGachaData = (gachaData) => {
        this.gachaData = gachaData;
    }

    getGachaData = () => {
        return this.gachaData;
    }

    setResetGacha = (isResetGacha) => {
        this.isResetGacha = isResetGacha;
    }

    getResetGacha = () => {
        return this.isResetGacha;
    }

}
const client = new nozomiBot({disableMentions: 'everyone'});

client.player = new Player(client);
client.config = require('./config/config');
client.emotes = client.config.emojis;
client.filters = client.config.filters;
client.commands = new discord.Collection();

fs.readdirSync('./commands').forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));

    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`LOG: Loading command ${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    };
});

const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));

for (const file of events) {
    console.log(`LOG: Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};

for (const file of player) {
    console.log(`LOG: Loading discord-player event ${file}`);
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};

// Catch the AUTISM
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

let updateAll = require('./database/updateDatabase/updateAll');
process.on("SIGINT", async () => (await updateAll(data), process.exit(0)));
process.on("SIGTERM", async () => (await updateAll(data), process.exit(0)));

//Initialize
let initAll = require('./database/updateObject/initAllObj');
initAll(client);

let initGacha = require('./database/updateObject/initGachaObj');
initGacha(client);

// Log In
console.log("LOG: Logging In To Princonne Bot");
client.login(process.env["BOT_TOKEN"]);
