const sn = '[BOT] -> '

const Discord = require('discord.js')
const dcClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const dcBot = require('./services/dcbot')

exports.start = async function start() {
  dcClient.on('ready', () => {
    global.log.debug(sn + `Logged in as ${dcClient.user.tag}!`)

    startDCBot(dcClient)
  })

  global.log.debug(sn + 'Login on Discord')
  dcClient.login(process.env.DISCORD_TOKEN)
}

async function startDCBot(dcClient) {
  global.log.debug(sn + 'Starting Discord-Bot')
  dcBot.start(dcClient)
}
