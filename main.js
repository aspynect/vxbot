const { Client, GatewayIntentBits, ReactionCollector } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] });
const secrets = require('./secrets.json');

let messageMap = new Map();

/*
    x check for twitter links
    x note the message, start timer to reply with vx link
    x if no update: vx 
    x if updates with embed:
    x embed=image: cancel timeout
    x embed=video: cancel timeout and send message
    add reaction to message that adds/removes c.vx

*/

async function processMessage(message) {
    console.log('processing message')

    messageMap.delete(message.id);
    let responseContent = message.cleanContent.replaceAll('twitter.com', 'vxtwitter.com');

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
    if (message.author == client.user) {return}
    console.log(`Message received: m${message.cleanContent}`)
    if (message.cleanContent.includes('https://twitter.com')) {
        console.log('Has twitter link');
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
            clearTimeout(messageMap.messageID);
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