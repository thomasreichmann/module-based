const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    if (message.author.id != "181270590672338944") return message.reply(`Voce nao tem permissao para utilizar esse comando!`)
    console.log(`Mass disconnect por commando, chamado por: ${message.author.username} no servidor ${message.guild.name}`)

    for (let queue in client.queues) {
        client.queues[queue].disconnect()
    }
}