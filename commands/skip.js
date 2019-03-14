const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let queue = client.queues[message.guild.id]
    queue.dispatcher.end()
}