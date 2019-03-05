const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]
    if (queue == undefined || queue.songs.length === 0) return message.channel.send(`Nenhuma musica foi adicionada na queue!\nAdicione musicas com o comando .play`)

    let response = ""
    let i = 1
    for (song of queue.songs) {
        response += `**${i}** - ${song.name}\n`
        if (i >= 10) break;
        i++
    }

    message.channel.send({
            "embed": {
                "color": 7536755,
                "fields": [{
                    "name": ":musical_note: Queue",
                    "value": response
                }]
            }
        })
        .catch(err => console.log(`Queue error on Rich Embed send:\n${err}`))
}