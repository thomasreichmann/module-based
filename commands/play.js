const Discord = require('discord.js')
const Queue = require('../classes/queue.js')
// HTML decoder (strings com &quot; e &#39;, Google API retorna nomes com esse encoding)
const he = require('he')

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

            let ytOptions = {
                part: 'snippet',
                videoEmbeddable: 'true',
                type: 'video',
                safeSearch: 'none',
                videoCategoryId: 10
            }
            let sufix = `official video`

            // Check se o link vem do youtube
            if (service == "youtube" || service == "youtu") {
                youtube.getPlaylist(args[0])
                    .then(playlist => {
                        playlist.getVideos(50)
                            .then(videos => {
                                // Indentificamos uma playlist, lidar com ela

                                console.log(`Uma playlist foi adicionada ${playlist.title}\n`)
                                let songs = []

                                videos.forEach(video => {
                                    songs.push({
                                        "name": video.title,
                                        "url": video.url
                                    })
                                });

                                queue.addSong(songs)
                            })
                            .catch(err => console.log(err))
                    })
                    .catch(() => {
                        // Nao temos uma playlist, logo ver se temos um link para um unico video
                        youtube.getVideo(args[0])
                            .then(video => {
                                // O arg era um link, logo podemos adcionar o video a queue
                                queue.addSong([{
                                    "name": video.title,
                                    "url": video.url
                                }])
                            })
                            .catch((err) => {
                                if (err) return console.log(`Erro ao pegar um video por link em play.js\n${err}`)
                                // Nao temos um link, logo temos um argumento para pesquisa
                                youtube.searchVideos(searchQuery, 1)
                                    .then(search => {
                                        let video = search[0]

                                        queue.addSong([{
                                            "name": video.title,
                                            "url": video.url
                                        }])
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
                    sp.getTrack(id)
                        .then(data => {
                            let title = `${data.body.name} - ${data.body.artists[0].name}`

                            youtube.searchVideos(`${title} ${sufix}`, 1, ytOptions)
                                .then(videos => videos.forEach(video => {

                                    // Talvez seja bom mudar essa regex para a primeira palavra do nome da musica.
                                    console.log(title)
                                    let r = new RegExp(title.split(`-`)[0].trim(), 'i')
                                    if (he.decode(video.title).trim().search(r) == -1) {
                                        message.channel.send({
                                            "embed": {
                                                "color": 7536755,
                                                "fields": [{
                                                    "name": `Musica nao encontrada`,
                                                    "value": `A musica **'${title}'** nao foi encontrada no youtube`
                                                }]
                                            }
                                        })
                                        .catch(err => console.log(err))

                                        if (queue.songs.length < 1) connection.disconnect();
                                        return;
                                    }

                                    queue.addSong([{
                                        "name": `${title}`,
                                        "url": video.url
                                    }])

                                    console.log(video.url)
                                }))
                        })
                        .catch(err => console.error(err))

                } else if (type == "album") {
                    console.log(`Found album`)
                    sp.getAlbumTracks(id)
                        .then(data => {
                            let songs = []

                            let items = data.body.items != undefined ? data.body.items : data.body.tracks.items

                            for (item of items) {
                                if (!songs.push) return

                                songs.push({
                                    name: `${item.name} - ${item.artists[0].name}`,
                                    url: null
                                })
                            }

                            // Array temporario das musicas
                            let tempS = songs

                            let length = songs.length
                            let j = 0;
                            for (let i = 0; i < length; i++) {

                                let sq = `${songs[i].name} ${sufix}`
                                youtube.searchVideos(sq, 1, ytOptions)
                                    .then(video => {
                                        if (!tempS[i] || !video[0]) return console.log(`ERROR on the start`)

                                        // Talvez seja bom mudar essa regex para a primeira palavra do nome da musica.
                                        let r = new RegExp(tempS[i].name.split(`-`)[0].trim(), 'i')
                                        if (he.decode(video[0].title).trim().search(r) == -1) {
                                            console.log(tempS[i].name.split(`-`)[0] + ` || ${he.decode(video[0].title)}`)
                                        } else {
                                            songs[i].url = video[0].url
                                            console.log(video[0].url)
                                        }

                                        /** 
                                        Apenas passe as musicas para a queue quando recebermos a ultima url requisitada j e utilizado 
                                        para manter conta de quantas urls ja foram recebidas, quando j == quantidade de musicas,
                                        nos podemos passar as musicas para a queue.
                                        */
                                        //console.log(`${j} - ${length - 1}`)
                                        if (j >= length - 1) {
                                            console.log(`finished`)
                                            queue.addSong(songs)
                                        }

                                        j++
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
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
                                    name: `${item.track.name} - ${item.track.artists[0].name}`,
                                    url: null
                                })
                            }

                            // Array temporario das musicas
                            let tempS = songs

                            let length = songs.length
                            let j = 0;
                            for (let i = 0; i < length; i++) {

                                let sq = `${songs[i].name} ${sufix}`
                                youtube.searchVideos(sq, 1, ytOptions)
                                    .then(video => {
                                        if (!tempS[i] || !video[0]) return console.log(`ERROR on the start`)

                                        // Talvez seja bom mudar essa regex para a primeira palavra do nome da musica.
                                        let r = new RegExp(tempS[i].name.split(`-`)[0].trim(), 'i')
                                        if (he.decode(video[0].title).trim().search(r) == -1) {
                                            //console.log(tempS[i].name.split(`-`)[0] + ` || ${he.decode(video[0].title)}`)
                                        } else {
                                            songs[i].url = video[0].url
                                        }

                                        /** 
                                        Apenas passe as musicas para a queue quando recebermos a ultima url requisitada j e utilizado 
                                        para manter conta de quantas urls ja foram recebidas, quando j == quantidade de musicas,
                                        nos podemos passar as musicas para a queue.
                                        */
                                        //console.log(`${j} - ${length - 1}`)
                                        if (j >= length - 1) {
                                            console.log(`finished`)
                                            queue.addSong(songs)
                                        }

                                        j++
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })
                        .catch(err => console.error(err))
                }
            } else {
                // Nenhum servico indentificado, logo temos uma pesquisa
                youtube.searchVideos(`${searchQuery}`, 1)
                    .then(search => {
                        let video = search[0]
                        if (!video) return message.reply(`Nenhum video foi encontrado com esse nome`)
                        queue.addSong([{
                            "name": video.title,
                            "url": video.url
                        }])
                    })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
}