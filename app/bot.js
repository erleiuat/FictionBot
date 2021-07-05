const sn = '[BOT] -> '

const Discord = require('discord.js')
const dcClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
const ftpWatcher = require('./services/ftpwatcher')
const logProcessor = require('./services/logprocessor/logprocessor')
const dcWriter = require('./services/dcwriter/dcwriter')
const state = require('./services/state')
const statistics = require('./services/statistics/statistics')
const cmdHandler = require('./services/cmdhandler/cmdhandler')
const dcHandler = require('./services/dchandler')
const dcBot = require('./services/dcbot')


exports.start = async function start() {

    /*
        Possible args:
        - dcBot     -> Discord functions for handling new Users etc.
        - logBot    -> Functions for processing log-data to discord and commands
        - inGame    -> Scum-Bot handling commands and more (only with -logBot enabled)
    */

    let args = process.argv.slice(2).map(el => el.replace('-', '').trim())
    dcClient.on('ready', () => {

        global.log.debug(sn + `Logged in as ${dcClient.user.tag}!`)

        if (args.includes('dcBot'))
            startDCBot(dcClient)

        if (args.includes('logBot'))
            startLogFunctions(dcClient)

        if (args.includes('inGame'))
            startIngameBot(dcClient)

    })

    global.log.debug(sn + 'Login on Discord')
    dcClient.login(process.env.DISCORD_TOKEN)

}


async function startDCBot(dcClient) {
    global.log.debug(sn + 'Starting Discord-Bot')
    dcBot.start(dcClient)
}

async function startLogFunctions(dcClient) {
    global.log.debug(sn + 'Starting Discord-Handler functionalities')
    dcHandler.start(dcClient)

    global.log.debug(sn + 'Starting Discord-Writer')
    dcWriter.start(dcClient)

    global.log.debug(sn + 'Starting State-Display')
    state.start(dcClient)

    global.log.debug(sn + 'Starting Statistics')
    statistics.start(dcClient)

    global.log.debug(sn + 'Starting FTP-Watcher')
    ftpWatcher.start()

    global.log.debug(sn + 'Starting Log-Processor')
    logProcessor.start()
}

async function startIngameBot(dcClient) {
    global.log.debug(sn + 'Starting Command-handler')
    cmdHandler.start()
}