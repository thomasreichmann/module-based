const Discord = require('discord.js')
const Queue = require('../classes/queue.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message) => {

    const youtube = client.youtube
    const sp = client.sp

    let prefix = client.config.servers[message.guild.id].prefix

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift()
    const guild = message.guild
    let queues = client.queues

    if (!message.member.voiceChannel) return message.reply("Voce nao esta em um Voice channel"); // acaba o comando caso o usuario nao esteja em um voice channel

    if (args.length == 0) return message.reply("Especifique um video ou playlist para ser tocado!");

    message.member.voiceChannel.join()
        .then(connection => {

            let queue = client.queues[guild.id]

            if (queue === undefined) {
                queues[guild.id] = new Queue(client, guild, connection)
                queue = queues[guild.id]
            }

            let searchQuery = args.join(" ")

            let service = args[0].replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split(".")[0].toLowerCase()

            // Check se o link vem do youtube
            if (service == "youtube" || service == "youtu") {
                youtube.getPlaylist(args[0])
                    .then(playlist => {
                        playlist.getVideos(50)
                            .then(videos => {
                                // Indentificamos uma playlist, lidar com ela

                                console.log(`\nUma playlist foi adicionada ${playlist.title}`)

                                videos.forEach(video => {
                                    queue.addSong(video.url, video.title)
                                    video.push(video.title)
                                });
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(() => {
                        // Nao temos uma playlist, logo ver se e um link para um unico video
                        youtube.getVideo(args[0])
                            .then(video => {
                                // O arg era um link, logo podemos adcionar o video a queue

                                if (queue.songs.length == 0) {
                                    queue.addSong(video.url, video.title)
                                } else {
                                    queue.addSong(video.url, video.title)
                                }
                            })
                            .catch((err) => {
                                if (err) return console.log(`Erro ao pegar um video por link em play.js\n${err}`)
                                // Nao temos um link, logo temos um argumento para pesquisa
                                youtube.searchVideos(searchQuery, 1)
                                    .then(search => {
                                        let video = search[0]

                                        if (queue.songs.length == 0) {
                                            console.log(`\nQueue foi iniciada com a musica ${video.title} Por pesquisa`)
                                            queue.addSong(video.url, video.title)
                                        } else {
                                            console.log(`\nA musica ${video.title} foi adicionada na queue`)
                                            queue.addSong(video.url, video.title)
                                        }

                                    })
                                    .catch(err => console.log(`Erro em search term em play.js\n${err}`))

                            })
                            .catch(err => console.log(err))
                    })
                // Fim do if (youtube)    
            } else if (service == "open") {
                // A url veio do spotify, lidar com ela

                let index = args[0].search(/(playlist|track|album)/)
                let parsed = args[0].substr(index).split("/")
                let type = parsed[0]
                let id = parsed[1]

                let songs = []

                //console.log(type, parsed)

                if (type == "track") {
                    console.log(`Found track`)
                    sp.getTrack(id)
                        .then(data => {
                            let sName = data.body.name
                            youtube.searchVideos(sName, 1)
                                .then(video => {
                                    queue.addSong(video[0].url, sName)
                                })
                                .catch(err => console.error(err))
                        })
                        .catch(err => console.error(err))

                } else if (type == "album") {
                    console.log(`Found album`)
                    sp.getAlbumTracks(id)
                        .then(data => {
                            let songs = []

                            for (song of data.body.items) {
                                if (!songs.push) return

                                songs.push({
                                    title: song.name,
                                    artist: song.artists[0].name
                                })
                            }

                            function queueVideos() {
                                let song = songs[0]

                                youtube.searchVideos(`${song.title} ${song.artist}`, 1)
                                    .then(video => {

                                        queue.addSong(video[0].url, video[0].title)

                                        songs.shift()

                                        if (songs.length > 0) queueVideos();
                                    })
                                    .catch(err => console.log(`Error on getAlbumTracks:\n${err}`))
                            }

                            queueVideos()
                        })
                        .catch(err => console.error(err))
                } else if (type == "playlist") {
                    sp.getPlaylistTracks(id)
                        .then(data => {

                            //data.body.items[0].name
                            data.body.tracks.items.forEach(i => {
                                let item = i.track
                                let sName = `${item.name} ${item.artists[0].name}`
                                youtube.searchVideos(sName, 1)
                                    .then(video => {
                                        queue.addSong(video[0].url, video[0].title)
                                    })
                                    .catch(err => console.error(err))
                            })
                        })
                        .catch(err => console.error(err))
                }
            } else {
                // Nenhum servico indentificado, logo temos uma pesquisa

                youtube.searchVideos(searchQuery, 1).then(search => {
                    let video = search[0]

                    queue.addSong(video.url, video.title)

                })
            }
        })
        .catch(err => console.log(err))
}