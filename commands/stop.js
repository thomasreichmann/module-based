const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]
    if(!queue) return console.log(`Erro, disconnect chamado sem queue`)
    queue.disconnect()
}