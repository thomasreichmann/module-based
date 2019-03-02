const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]

    if (queue === undefined) return message.reply(`Nenhuma musica esta sendo tocada`)

    queue.loop = !queue.loop
    console.log(queue.loop)
} 