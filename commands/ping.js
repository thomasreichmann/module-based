const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    message.reply(`Pong!`)
}