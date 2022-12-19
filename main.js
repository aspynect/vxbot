const { match } = require('assert');
const { Client, GatewayIntentBits, ReactionCollector } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });
const secrets = require('./secrets.json');

const twitReg = new RegExp('ab+c');

let messageMap = new Map();


async function processMessage(message) {
    console.log('processing message')
    messageMap.delete(message.id);

    let twitLinks = twitReg.match(message.cleanContent)
    let responseContent = ""
    for (const match in twitLinks) {
        responseContent = concat(responseContent, twitLinks[match], "\n")
    }

    let responseMessage = await message.reply(responseContent);
    responseMessage.react('🔀');
}

async function messageReprocess(message) {
    console.log('Remixing message')
    let content = message.cleanContent
    let fixedContent
    if (content.includes('c.vxtwitter.com')) {
        fixedContent = content.replaceAll('c.vxtwitter.com', 'vxtwitter.com');
    } else {
        fixedContent = content.replaceAll('vxtwitter.com', 'c.vxtwitter.com');
    }
    await message.edit(fixedContent);
    message.react('🔀');
}

//false: no embed, video embed
//true: non video embed
function embedCheck(message) {
    if (message.embeds.length === 0) {return false}
    for (const embed of message.embeds) {
        if (embed.video){return false}
    }
    return true;
}


client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    let messageContent = message.cleanContent

    if (message.author == client.user) {return}
    if (messageContent.includes('<https://twitter.com') && messageContent.includes('>')) {
        console.log('Forcefully non-embedded message');
        return;
    }

    console.log(`Message received: m${messageContent}`)
    if (twitReg.test()) {
        console.log('Has good twitter link');
        if (!embedCheck(message)) {
            messageMap.set(message.id, setTimeout(() => processMessage(message), 5000));
        } //exit if embeds work
    } else {console.log('No link')}
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
    let messageID = newMessage.id
    if (messageMap.has(messageID)) {
        console.log('Important message update');
        if (!embedCheck(newMessage)) {
            clearTimeout(messageMap.get(newMessage.id));
            processMessage(newMessage);
        } //if its good its good
    }
})

client.on('messageReactionAdd', async (reaction, reactionAuthor) => {
    console.log('new reaction');
    if (reactionAuthor === client.user) {return}
    if (reaction.emoji.name === '🔀') {
        await reaction.message.reactions.removeAll();
        await messageReprocess(reaction.message);
    }
})


client.login(secrets.token);