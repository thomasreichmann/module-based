const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let channel = message.member.voiceChannel 

    if (client.queues[message.guild.id]) return message.reply(`Esse comando nao pode ser utilizado enquanto uma musica estiver tocando.\nUse o comando "stop" para remover as musicas.`)

    let amt = args[0]
    if (amt == undefined || amt > 20) return null
    if (!channel) return message.reply(`Voce nao esta em um canal de voz`)

    let i = 0
    join()

    function join() {
        channel.join()
            .then(() => {
                channel.leave()
                if (i > args[0]) return console.log(`Fim do spam`)
                i++
                join()
            })
    }
}