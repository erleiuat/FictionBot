const sn = '[DISCORD-HANDLER] -> '

async function consoleMsg(msg) {
  if (
    msg.member.hasPermission('ADMINISTRATOR') &&
    msg.author.id !== process.env.DISCORD_BOT_ID
  ) {
    global.log.debug(sn + 'Console message detected!')
    global.commands[msg.id] = {
      message: 'console_msg',
      user: msg.author.username,
      content: msg.content.trim()
    }
    await msg.delete()
  }
}

async function chatMsg(msg) {
  if (msg.author.id !== process.env.DISCORD_BOT_ID) {
    if (
      msg.content.trim().startsWith('#') ||
      msg.content.trim().startsWith('/')
    ) {
      await msg.delete()
      return
    }
    global.log.debug(sn + 'Chat message detected!')
    global.commands[msg.id] = {
      message: 'console_msg',
      user: '[Discord] ' + msg.author.username,
      content: msg.content.trim()
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
