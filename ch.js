const ch = module.exports

ch.reloadEvents = reloadEvents
ch.reloadCommands = reloadCommands

// Prepara todos os eventos para serem executados
function reloadEvents() {
    fs.readFile("./events.js", (err, files) => {
        if (err) return console.log(`Erro ao carregar os arquivos de eventos\n${err}`)
        files.forEach(file => {
            if (!file.endsWith(".js")) return

            const event = require(`./events/${file}`)

            let eventName = file.split('.')[0]

            client.on(eventName, event.bind(null, client));
            delete require.cache[require.resolve(`./events/${file}`)];
        });
    })
}
// Prepara todos os eventos para serem executados
function reloadCommands() {
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
}