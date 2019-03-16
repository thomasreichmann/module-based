const Discord = require('discord.js')
const Queue = require('../classes/queue.js')

exports.run = ( /** @type {Discord.Client} */ client, /** @type {Discord.Message} */ message, args) => {

    const youtube = client.youtube
    const sp = client.sp
    
    const guild = message.guild
    let queues = client.queues

    // Finaliza o comando caso o usuario nao esteja em um voice channel
    if (!message.member.voiceChannel) return message.reply("Voce nao esta em um Voice channel");

    if (args.length == 0) return message.reply("Especifique um video ou playlist para ser tocado!");

    message.member.voiceChannel.join()
        .then(connection => {

            let queue = client.queues[guild.id]

            if (queue === undefined) {
                queues[guild.id] = new Queue(client, guild, connection, message.channel)
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

                                console.log(`Uma playlist foi adicionada ${playlist.title}\n`)

                                videos.forEach(video => {
                                    queue.addSong(video.url, video.title)
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
                // Define se temos um playlist|track|album
                let type = parsed[0]
                // Define o id da playlist|track|album
                let id = parsed[1]

                if (type == "track") {
                    console.log(`Found track`)
                    sp.getTrack(id)
                        .then(data => {
                            let sName = `${data.body.name} ${data.body.artists[0]} music`
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

                            for (item of data.body.items) {
                                if (!songs.push) return

                                songs.push({
                                    title: item.name,
                                    artist: item.artists[0].name,
                                    url: ''
                                })
                            }

                            let j = 0;
                            for (let i = 0; i < songs.length; i++) {

                                youtube.searchVideos(`${songs[i].title} ${songs[i].artist} music`, 1)
                                    .then(video => {
                                        songs[i].url = video[0].url
                                        /** 
                                        Apenas passe as musicas para a queue quando recebermos a ultima url requisitada j e utilizado 
                                        para manter conta de quantas urls ja foram recebidas, quando j == quantidade de musicas,
                                        nos podemos passar as musicas para a queue.
                                        */
                                        if (j === songs.length - 1) {
                                            songs.forEach(song => queue.addSong(song.url, song.title))
                                        }

                                        j++
                                    })
                                    .catch(err => console.log(err))
                            }
                        })
                        .catch(err => console.error(err))
                } else if (type == "playlist") {
                    sp.getPlaylistTracks(id)
                        .then(data => {

                            let songs = []

                            let items = data.body.items != undefined ? data.body.items : data.body.tracks.items

                            for (item of items) {
                                if (!songs.push) return

                                songs.push({
                                    title: item.track.name,
                                    artist: item.track.artists[0].name,
                                    url: ''
                                })
                            }

                            let j = 0;
                            for (let i = 0; i < songs.length; i++) {

                                youtube.searchVideos(`${songs[i].title} ${songs[i].artist} music`, 1)
                                    .then(video => {
                                        songs[i].url = video[0].url
                                        /** 
                                        Apenas passe as musicas para a queue quando recebermos a ultima url requisitada j e utilizado 
                                        para manter conta de quantas urls ja foram recebidas, quando j == quantidade de musicas,
                                        nos podemos passar as musicas para a queue.
                                        */
                                        if (j === songs.length - 1) {
                                            songs.forEach(song => queue.addSong(song.url, song.title))
                                        }

                                        j++
                                    })
                                    .catch(err => console.log(err))
                            }
                        })
                        .catch(err => console.error(err))
                }
            } else {
                // Nenhum servico indentificado, logo temos uma pesquisa
                youtube.searchVideos(`${searchQuery} music`, 1)
                .then(search => {
                    let video = search[0]
                    queue.addSong(video.url, video.title)

                })
            }
        })
        .catch(err => console.log(err))
}