module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'Core',
    utilisation: '{prefix}help',

    execute(client, message, args) {
        if (!args[0]) {
            const profile = message.client.commands.filter(x => x.category == 'profile').map((x) => '`' + x.name + '`').join(', ');
            const clanbattle = message.client.commands.filter(x => x.category == 'clanbattle').map((x) => '`' + x.name + '`').join(', ');
            const ocr = message.client.commands.filter(x => x.category == 'OCR').map((x) => '`' + x.name + '`').join(', ');
            const core = message.client.commands.filter(x => x.category == 'core').map((x) => '`' + x.name + '`').join(', ');
            const music = message.client.commands.filter(x => x.category == 'music').map((x) => '`' + x.name + '`').join(', ');

            message.channel.send({
                embed: {
                    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    author: { name: 'Bot Help' },
                    footer: { text: client.config.discord.footerText },
                    fields: [
                        { name: 'Profile', value: profile },
                        { name: 'Clan Battle', value: clanbattle },
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

            let description_text = 'Find information on the command provided.\nMandatory arguments `[]`, optional arguments `<>`.\n\n';
            switch (command) {
                case message.client.commands.get('profile'):
                    description_text += `Obtain your / @user's profile information.`;
                    break;
                case message.client.commands.get('getattacks'):
                    description_text += `Obtain your / @user's attack information on a specific date.`;
                    break;
                case message.client.commands.get('getclanbattle'):
                    description_text += `Obtain your / @user's Clan Battle information on a specific month.`;
                    break;
                case message.client.commands.get('clanbattletimeline'):
                    description_text += `Obtain a directory of all available Clan Battles and when they occured.`;
                    break;
                case message.client.commands.get('daily'):
                    description_text += `Grants you gems daily.`;
                    break;
                case message.client.commands.get('rollgacha'):
                    description_text += `Plays the Gacha.`;
                    break;
                case message.client.commands.get('characters'):
                    description_text += `View the characters you've obtained from gacha.`;
                    break;
                case message.client.commands.get('character'):
                    description_text += `View full art of a character you've obtained from gacha.`;
                    break;
                case message.client.commands.get('scanimage'):
                    description_text += `Make sure to upload a screenshot of the game as an attachment. \n`;
                    description_text += `Example images provided below.`;
                    break;
            }

            message.channel.send({
                embed: {
                    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    author: { name: 'Detailed Help' },
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
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex2 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Image 2 Example`)
                    .setDescription(`Example Screenshot For Clan Battle`)
                    .attachFiles(['./img/ex2.png'])
                    .setImage('attachment://ex2.png')
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex3 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Image 3 Example`)
                    .setDescription(`Example Screenshot For Clan Battle`)
                    .attachFiles(['./img/ex3.png'])
                    .setImage('attachment://ex3.png')
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();
            
                let ex4 = new MessageEmbed()
                    .setColor(`#${Math.floor(Math.random()*16777215).toString(16)}`)
                    .setAuthor(client.user.username, client.user.avatarURL())
                    .setTitle(`Setting Nozomi Bot To Only Search For 2 Attempts`)
                    .setDescription(`How To Upload Screenshot`)
                    .attachFiles(['./img/ex4.png'])
                    .setImage('attachment://ex4.png')
                    .setFooter(footerText, client.user.avatarURL())
                    .setTimestamp();
                
                message.channel.send(ex1);
                message.channel.send(ex2);
                message.channel.send(ex3);
                message.channel.send(ex4);
            }
        };
    },
};