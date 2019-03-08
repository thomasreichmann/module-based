const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]
    if (queue == undefined || queue.songs.length === 0) return message.channel.send(`Nenhuma musica foi adicionada na queue!\nAdicione musicas com o comando .play`)

    let prefix = client.config.servers[message.guild.id].prefix
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift()

    let s;
    let response = '';

    if (args[0]) {
        if (args[0] > 1) {
            s = (args[0] - 1) * 10
        } else {
            s = 0
        }
    } else {
        s = 0
    }

    if (s > queue.songs.length - 1) return message.reply(`Essa pagina nao existe na queue`)

    i = s;

    while (i < queue.songs.length) {
        let song = queue.songs[i]

        response += `**${i + 1}** - ${song.name}\n`
        if (i >= s + 9) break;
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