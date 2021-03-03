module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'Core',
    utilisation: '{prefix}help',

    execute(client, message, args) {
        if (!args[0]) {
            const profile = message.client.commands.filter(x => x.category == 'Profile').map((x) => '`' + x.name + '`').join(', ');
            const clanbattle = message.client.commands.filter(x => x.category == 'Clan Battle').map((x) => '`' + x.name + '`').join(', ');
            const gacha = message.client.commands.filter(x => x.category == 'Gacha').map((x) => '`' + x.name + '`').join(', ');
            const ocr = message.client.commands.filter(x => x.category == 'OCR').map((x) => '`' + x.name + '`').join(', ');
            const core = message.client.commands.filter(x => x.category == 'Core').map((x) => '`' + x.name + '`').join(', ');
            const music = message.client.commands.filter(x => x.category == 'Music').map((x) => '`' + x.name + '`').join(', ');

            message.channel.send({
                embed: {
                    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    author: { name: 'Bot Help' },
                    footer: { text: client.config.discord.footerText },
                    fields: [
                        { name: 'Profile', value: profile },
                        { name: 'Clan Battle', value: clanbattle },
                        { name: 'Gacha', value: gacha },
                        { name: 'Image Detection', value: ocr },
                        { name: 'General', value: core },
                        { name: 'Music', value: music },
                        { name: 'Filters', value: client.filters.map((x) => '`' + x + '`').join(', ') },
                    ],
                    timestamp: new Date(),
                    description: `To use filters, ${client.config.discord.prefix}filter (the filter). Example : ${client.config.discord.prefix}filter 8D.`,
                },
            });
        } else {
            const command = message.client.commands.get(args.join(" ").toLowerCase()) || message.client.commands.find(x => x.aliases && x.aliases.includes(args.join(" ").toLowerCase()));

            if (!command) return message.channel.send(`${client.emotes.error} - I did not find this command !`);

            let description_text = `${command.description}\nMandatory arguments \`[]\`, optional arguments \`<>\`.`;

            message.channel.send({
                embed: {
                    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    author: { name: args.join(" ").toLowerCase() },
                    footer: { text: client.config.discord.footerText },
                    fields: [
                        { name: 'Name', value: command.name, inline: true },
                        { name: 'Category', value: command.category, inline: true },
                        { name: 'Aliase(s)', value: command.aliases.length < 1 ? 'None' : command.aliases.join(', '), inline: true },
                        { name: 'Utilisation', value: command.utilisation.replace('{prefix}', client.config.discord.prefix), inline: true },
                    ],
                    timestamp: new Date(),
                    description: description_text,
                }
            });

            if (command == message.client.commands.get('scanimage')) {
                const { MessageEmbed } = require("discord.js");

                let ex1 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Image 1 Example`)
                    .setDescription(`Example Screenshot For Clan Battle`)
                    .attachFiles(['./img/ex1.png'])
                    .setImage('attachment://ex1.png')
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex2 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Image 2 Example`)
                    .setDescription(`Example Screenshot For Clan Battle`)
                    .attachFiles(['./img/ex2.png'])
                    .setImage('attachment://ex2.png')
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex3 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Image 3 Example`)
                    .setDescription(`Example Screenshot For Clan Battle`)
                    .attachFiles(['./img/ex3.png'])
                    .setImage('attachment://ex3.png')
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex4 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Setting Nozomi Bot To Only Search For 2 Attempts`)
                    .setDescription(`How To Upload Screenshot`)
                    .attachFiles(['./img/ex4.png'])
                    .setImage('attachment://ex4.png')
                    .setFooter(client.config.discord.footerText, client.user.avatarURL())
                    .setTimestamp();
                
                message.channel.send(ex1);
                message.channel.send(ex2);
                message.channel.send(ex3);
                message.channel.send(ex4);
            }
        };
    },
};