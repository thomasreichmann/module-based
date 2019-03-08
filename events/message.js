const Discord = require('discord.js')
const fs = require('fs')

module.exports = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
  if (message.guild == null) return
  if (message.author.bot) return;

  // Commando ghost
  if (message.author.id == '181270590672338944' && client.ghost == true) {
    message.delete().catch(err => console.log(err))
  }

  let config = client.config

  if (!config.servers[message.guild.id]) {
    let id = message.guild.id
    client.config.servers[id] = {
      prefix: "."
    }
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
  }

  let prefix = config.servers[message.guild.id].prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) return;

  // Run the command
  cmd.run(client, message, args);
};