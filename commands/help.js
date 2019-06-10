const Discord = require('discord.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    message.channel.send({
        "embed": {
            "color": 7536755,
            "title": "**Commandos**",
            "fields": [{
                    "name": "play",
                    "value": `Use o 'play' com um link do youtube, spotify ou um termo para pesquisa`
                },
                {
                    "name": "loop",
                    "value": `'Loop' define se a musica atual deve ser repetida, caso querira repetir a queue atual utilize 'loop q'`
                },
                {
                    "name": "queue",
                    "value": "Mostra uma lista das musicas que serao tocadas, utilize 'queue (1, 2, 3, ...)' para ver outras paginas"
                }
            ]
        }
    })
}