const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]
    if (queue == undefined || queue.songs.length === 0) return message.channel.send(`Nenhuma musica foi adicionada na queue!\nAdicione musicas com o comando .play`)

    message.channel.send({
        "embed": {
            "color": 7536755,
            "fields": [{
                "name": "Tocando :musical_note:",
                "value": queue.songs[0].name
            }]
        }
    })
}