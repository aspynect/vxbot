const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const secrets = require('./secrets.json');

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async interaction => {
    if ((interaction.cleanContent).includes('twitter.com')) {

    }
})