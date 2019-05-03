## Module based
Esse repo contem um re-write de um dos meus bots, com o foco sendo criar um bot decentemente organizado e modular,
ele foi feito em node.js com discord.js https://discord.js.org/

Para configurar o bot e necessario criar um arquivo .env e preencher ele com o formato abaixo,
com a configuracao pronta, o bot pode ser iniciado com `node main.js`.

```
TOKEN = DISCORD_BOT_TOKEN
YOUTUBE_API_KEY = #
SPOTIFY_CLIENT_ID = #
SPOTIFY_CLIENT_SECRET = #
MYSQL_HOST = MYSQL_HOST_IP
MYSQL_DATABASE = 
MYSQL_PASS = 
```

O bot em seu estado atual e compativel com o heroku, apenas defina as env variables com o mesmo formato acima.