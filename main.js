const Discord = require('discord.js');
const client = new Discord.Client();
const Enmap = require('enmap')
const dot = require('dotenv')
dot.config()

const fs = require('fs');
const rp = require('xmlhttprequest');

const config = require('./config.json');

const Youtube = require('simple-youtube-api')

require('./functions.js')

client.ghost = false;

const spotify_web_api = require('spotify-web-api-node')
client.sp = new spotify_web_api({
    clientId: process.env.spotifyClientId,
    clientSecret: process.env.spotifyClientSecret
})

client.youtube = new Youtube(process.env.youtubeApiKey);
client.config = config
client.commands = new Enmap();
client.queues = {}

function getSpToken() {
    let req = new rp.XMLHttpRequest()

    req.onreadystatechange = () => {
        if (req.status == 200 && req.readyState == 4) {
            let response = JSON.parse(req.responseText)
            spotifyToken = response.access_token
            client.sp.setAccessToken(spotifyToken)
            console.log(`Spotify token re-definido com sucesso`)

        } else if (req.readyState == 4 && req.status != 200) {
            console.log(`Spotify token request error, State: ${req.readyState}, Status: ${req.status}`)
        }
    }
    req.handleError = (err) => console.log(`Spotify token request internal error: \n${err}`)

    let id = process.env.spotifyClientId
    let secret = process.env.spotifyClientSecret
    let url = `https://accounts.spotify.com/api/token`
    let body = `grant_type=client_credentials`

    req.open('POST', url, true)
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    req.setRequestHeader("Authorization", `Basic ${btoa(`${id}:${secret}`)}`)
    req.send(body)
}

getSpToken()
spInterval = setInterval(getSpToken, 3000000);

fs.readdir("./events", (err, files) => {
    if (err) return console.log(`Erro ao carregar os arquivos de eventos\n${err}`)
    files.forEach(file => {
        if (!file.endsWith(".js")) return

        const event = require(`./events/${file}`)

        let eventName = file.split('.')[0]

        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
})

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;

        let props = require(`./commands/${file}`);

        let commandName = file.split(".")[0];
        console.log(`Carregando o comando ${commandName}`);

        client.commands.set(commandName, props);
    });
});

client.on("error", (e) => console.error(e)); // Para o bot nao crashar / crashar sem nenhuma mensagem de erro
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

client.login(process.env.token);