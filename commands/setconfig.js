const Discord = require('discord.js')
const fs = require('fs')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let id = message.guild.id
    client.config.servers[id] = {
        prefix: "."
    }
    fs.writeFile(`../config.json`, client.config, (err) => console.log(`Erro ao salvar a config em setconfig\n${err}`))
}