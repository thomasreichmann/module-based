const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let channel = message.member.voiceChannel
    let prefix = client.config.servers[message.guild.id].prefix
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift()

    if (client.queues[message.guild.id]) return message.reply(`Esse comando nao pode ser utilizado enquanto uma musica estiver tocando.`)

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