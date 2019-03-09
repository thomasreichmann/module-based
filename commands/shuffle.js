const Discord = require('discord.js')
const Queue = require('../classes/queue.js')

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {
    let /**@type {Queue} */ queue = client.queues[message.guild.id]

    if (queue === undefined) return message.reply(`Nenhuma musica esta sendo tocada`)

    let s = shuffle(queue.songs)

    queue.songs = s
}