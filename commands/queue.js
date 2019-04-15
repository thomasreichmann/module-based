const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let queue = client.queues[message.guild.id]
    if (queue == undefined || queue.songs.length === 0) return message.channel.send(`Nenhuma musica foi adicionada na queue!\nAdicione musicas com o comando .play`)

    let s = args[0] > 1 ? (args[0] - 1) * 10 : 0
    let response = '';

    if (s > queue.songs.length - 1) return message.reply(`Essa pagina nao existe na queue`)

    i = s;

    while (i < queue.songs.length) {
        let song = queue.songs[i]

        response += `**${i + 1} -** ${song.name}\n`
        if (i >= s + 9) break;
        i++
    }

    message.channel.send({
            "embed": {
                "color": 7536755,
                "fields": [{
                    "name": "Queue :musical_note:",
                    "value": response
                }]
            }
        })
        .catch(err => console.log(`Queue error on Rich Embed send:\n${err}`))
}