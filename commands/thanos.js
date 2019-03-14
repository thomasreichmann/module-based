const Discord = require('discord.js')

exports.run = (/** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {
    let members = message.guild.members.array()
    let die = []

    members.forEach(member => {
        if(Math.random() < 0.5) {
            die.push(member)
        }
    })

    let response = ""

    for (/**@type {Discord.Member} */member of die) {
        response += `@${member.user.username}\n`
    }

    message.channel.send({
        "embed": {
            "color": 7536755,
            "fields": [{
                "name": "**:skull: Thanos snapped :skull:**",
                "value": response
            }]
        }
    })
    .catch(err => console.log(err))
}