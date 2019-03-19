const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let queue = client.queues[message.guild.id]

    if (!queue) return message.reply(`Nenhuma musica esta sendo tocada no momento.`)
    queue.dispatcher.end()
}