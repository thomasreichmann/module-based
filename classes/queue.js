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

    addSong(s) {
        // Caso a musica do spotify nao for encontrada a url sera = null, logo pulamos a musica (mesmo que skip.js)
        let added = 0;
        for (let i = 0; i < s.length; i++) {
            const song = s[i];

            if (song == null || song.url == null) continue;
            this.songs.push(song)
            added++
        }

        // s.forEach(song => {
        //     this.songs.push(song)
        // });

        if (s.length < 1) throw "Erro na adicao de musicas, queue.js (classe):\ns.length < 1"

        if (s.length > 1) {
            console.log(`${s.length} Musicas adicionadas a queue da guild "${this.channel.guild.name}"`)
            this.channel.send({
                "embed": {
                    "color": 7536755,
                    "fields": [{
                        "name": `Playlist adicionada :musical_note:`,
                        "value": `**${added}** Musicas`
                    }]
                }
            })
        } else {
            console.log(`A musica "${s[0].name}" foi adicionada a guild "${this.channel.guild.name}"`)

            this.channel.send({
                "embed": {
                    "color": 7536755,
                    "fields": [{
                        "name": "Musica adicionada :musical_note:",
                        "value": s[0].name.replace('official video', ' ')
                    }]
                }
            })
        }

        if (!this.playing) this.play()
    }

    play() {
        if (this.songs.length == 0) this.disconnect()

        // Caso a primeira musica nao tenha url, sabemos que ela nao foi encontrada pelo spotify.
        if (!this.songs[0].url) {
            // Resolver a falta de url, por enquanto apenas pulamos a musica, mas seria bom dar um aviso ao usuario.
            this.songs.shift()
        }

        this.playing = true;

        //console.log(`DEBUG: next: ${this.songs[0].name} || ${this.songs[0].url}`)

        this.dispatcher = this.connection.playStream(yt(this.songs[0].url, {
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