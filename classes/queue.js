const yt = require('ytdl-core')
const Discord = require('discord.js')

module.exports = class Queue {
    constructor(client, guild, connection, channel) {
        this.guild = guild
        this.connection = connection
        /**@type {Discord.TextChannel} */
        this.channel = channel
        /**@type {Discord.Client} */
        this.client = client

        this.songs = []
        /**@type {Discord.StreamDispatcher} */
        this.dispatcher;

        this.loop = false;
        this.qloop = false;
        this.playing = false;
    }

    disconnect() {
        this.playing = false;
        this.songs = undefined
        this.dispatcher = undefined
        this.connection.disconnect();
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

        this.channel.send({
            "embed": {
                "color": 7536755,
                "fields": [{
                    "name": "Tocando :musical_note:",
                    "value": this.songs[0].name
                }]
            }
        })

        this.dispatcher = this.connection.playStream(yt(`${this.songs[0].url} music`, {
                filter: 'audioonly'
            }), {
                bitrate: 'auto'
            })
            .on('end', () => {
                if (!this.songs) return this.disconnect()

                if (this.qloop && !this.loop) {
                    let s = this.songs.shift()
                    this.addSong(s.url, s.name)
                } else if (!this.loop) {
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
            .on('error', (err) => console.log(err))
    }
}