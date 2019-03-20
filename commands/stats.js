const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let users = 0;
    let guilds = 0;

    client.guilds.forEach(guild => {
        users += guild.members.size
        guilds++
    })

    message.channel.send({
        "embed": {
            "color": 7536755,
            "fields": [{
                    "name": "Guilds 🗄️",
                    "value": guilds
                },
                {
                    "name": "Users 👥",
                    "value": users
                }
            ]
        }
    })
}