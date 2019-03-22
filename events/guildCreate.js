const Discord = require('discord.js')

module.exports = ( /** @type {Discord.Client} */ client, /** @type {Discord.Guild} */ guild) => {
  let prefix = '.'
  let q = `INSERT INTO servers VALUES ('${guild.id}', '${prefix}');`
  client.connection.query(q, (error, results) => {
    if (error) throw error
    console.log(`Nova guild adicionada a database: '${guild.name}';'${guild.id}'`)
    // Adiciona a guild ao Enmap de configs
    client.config.set(guild.id, `${prefix}`)
  })
}