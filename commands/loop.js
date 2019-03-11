const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let queue = client.queues[message.guild.id]
    if (!queue) return message.reply(`Nenhuma musica esta sendo tocada`)

    let prefix = client.config.servers[message.guild.id].prefix
    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift()

    // Loop mode
    let lm = ''

    if (args[0] == 'q') {
        queue.qloop = !queue.qloop
        queue.loop = false
        lm = queue.qloop === true ? "Queue loop ✅" : "Queue loop ❌"
    } else {
        queue.loop = !queue.loop
        queue.qloop = false
        lm = queue.loop === true ? "Loop ✅" : "Loop ❌"
    }

    message.channel.send({
        "embed": {
            "color": 7536755,
            "fields": [{
                "name": "Loop mode",
                "value": lm
            }]
        }
    })
}