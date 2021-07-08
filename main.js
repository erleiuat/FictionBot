let logTS = new Date().getTime()
const winston = require('winston')
global.log = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'app/logs/log_' + logTS + '.log'
        })
    ]
})

const sn = '[MAIN] -> '

global.log.debug('\n\n' + sn + '----------------------------------------------------------')
global.log.debug(sn + 'Welcome to FictionBot 2.0!')
global.log.debug(sn + '----------------------------------------------------------')

global.log.debug(sn + 'Starting directory: ' + process.cwd())
try {
    process.chdir(__dirname)
    global.log.debug(sn + 'New directory: ' + process.cwd())
} catch (err) {
    global.log.debug(sn + 'chdir: ' + err)
}

process.on('uncaughtException', err => {
    console.error(sn + 'There was an uncaught error', err)
    process.exit(1)
})

process.on('unhandledRejection', err => {
    global.log.debug(sn + 'Unhandled rejection', err)
    process.exit(1)
})

global.log.debug(sn + '----------------------------------------------------------')
global.log.debug(sn + 'Bot initialized, starting processes')
global.log.debug(sn + '----------------------------------------------------------\n')

require('dotenv').config()
global.admins = require('./app/plugins/admins')
global.sleep = require('./app/plugins/sleep')
global.nZero = require('./app/plugins/nzero')
global.io = require('@pm2/io')
global.gameReady = false
global.ingameTime = false
global.playersOnline = 0
global.newCmds = false
global.playerlist = {}
global.updatingFTP = false
global.updates = true
global.commands = {}
global.newEntries = {
    mines: {},
    chat: {},
    admin: {},
    login: {},
    kill: {},
    maps: {}
}

const bot = require('./app/bot')
bot.start()
