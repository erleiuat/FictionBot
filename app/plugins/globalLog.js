const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format
let now = new Date()
let logTS = now.getFullYear() + '_' + (now.getMonth() + 1) + '_' + now.getDate() + '_' + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds()

global.log = createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp }) => {
            return `${timestamp}: ${message}`
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'app/logs/log_' + logTS + '.log'
        })
    ]
})
