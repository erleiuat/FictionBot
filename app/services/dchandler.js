const sn = global.chalk.red('[DISCORD-HANDLER] -> ')

async function consoleMsg(msg) {
    if (
        msg.member.hasPermission('ADMINISTRATOR') &&
        msg.author.id !== process.env.DISCORD_BOT_ID
    ) {
        console.log(sn + 'Console message detected!')
        global.commands[msg.id] = {
            message: 'console_msg',
            user: msg.author.username,
            content: msg.content
        }
        await msg.delete()
    }
}

async function chatMsg(msg) {
    if (msg.author.id !== process.env.DISCORD_BOT_ID) {
        if (msg.content.toLowerCase().includes('#')) {
            await msg.delete()
            return
        }
        console.log(sn + 'Chat message detected!')
        global.commands[msg.id] = {
            message: 'console_msg',
            user: '[DISCORD]' + msg.author.username,
            content: msg.content
        }
        await msg.delete()
    }
}

exports.start = async function start(dcClient) {
    dcClient.on('message', async msg => {
        if (msg.channel.id == process.env.DISCORD_CH_CONSOLE) consoleMsg(msg)
        else if (msg.channel.id == process.env.DISCORD_CH_CHAT) chatMsg(msg)
    })
}