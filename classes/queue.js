const yt = require('ytdl-core')
const Discord = require('discord.js')

module.exports = class Queue {
    constructor(client, guild, connection) {
        this.guild = guild
        this.connection = connection
        /**@type {Discord.Client} */
        this.client = client

        this.songs = []
        this.dispatcher;

        this.loop = false;
        this.playing = false;
    }

    disconnect() {
        this.playing = false;
        this.connection.disconnect();
        this.songs = undefined
        this.dispatcher = undefined
        this.client.queues[this.guild.id] = undefined
    }

    addSong(url, name) {
        let song = {
            url: url,
            name: name
        }

        this.songs.push(song)

        console.log(`A musica "${name}" foi adicionada na queue Guild "${this.guild.name}"`)

        if (!this.playing) this.play()
    }

    play() {

        if (this.songs.length == 0) this.disconnect()

        this.playing = true;

        this.dispatcher = this.connection.playStream(yt(this.songs[0].url, {
                filter: 'audioonly'
            }), {
                bitrate: 'auto'
            })
            .on('end', () => {
                if (!this.songs) return this.disconnect()

                if (this.loop == false) {
                    console.log(`Musica ${this.songs[0].name} foi removida da queue Guild ${this.guild.name}`)
                    this.songs.shift()
                }

                if (this.songs.length == 0) {
                    this.disconnect()
                    return console.log(`Saindo do canal de voz Guild ${this.guild.name}`)
                }

                console.log(`Proxima musica "${this.songs[0].name}" Guild "${this.guild.name}"`)

                this.play()
            })
    }
}