const Discord = require('discord.js')
const fs = require('fs')
const mysql = require('mysql')

module.exports = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
  if (message.guild == null) return
  if (message.author.bot) return;

  // Commando ghost
  if (message.author.id == '181270590672338944' && client.ghost == true) {
    message.delete().catch(err => console.log(err))
  }

  let serverConfig = client.config.get(message.guild.id);

  // Prefix pode ser = . desde o comeco ja que no final da query esse sera o prefixo adicionado a database e a config.
  let prefix = '.';
  if (!serverConfig) {
    // Definicao da query
    let q = `INSERT INTO servers VALUES ('${message.guild.id}', '${prefix}');`
    client.connection.query(q, (error, results) => {
      if (error) throw error
      console.log(`Nova guild adicionada a database: '${message.guild.name}';'${message.guild.id}'`)
      // Adiciona a guild ao Enmap de configs
      client.config.set(message.guild.id, prefix)
    })
  } else {
    prefix = serverConfig.prefix
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);

  if (!cmd) return;
  cmd.run(client, message, args);
};