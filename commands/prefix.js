const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    if (!args[0]) return message.reply(`Especifique o novo prefixo da guild`)

    let server = client.config.get(message.guild.id)
    server.prefix = args[0]
    client.config.set(message.guild.id, server)
    client.connection.query(`UPDATE servers SET prefix = '${args[0]}' WHERE id = '${message.guild.id}'`, (err, results, x) => {
        if (err) throw err
        console.log(`Prefixo alterado no servidor ${message.guild.id}`)
        message.reply(`O prefixo do servidor foi alterado para '${args[0]}'`)
    })
}