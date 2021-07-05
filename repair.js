require('dotenv').config()
const sn = '[REPAIR] -> '
const fs = require('fs')
const ftp_rm = new(require('basic-ftp')).Client()
const ftp_pp = new(require('basic-ftp')).Client()
global.nZero = require('./app/plugins/nzero')
global.playerlist = {}
const winston = require('winston')
let logTS = new Date().getTime()
global.log = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'app/logs/repair_log_' + logTS + '.log'
        })
    ],
})
const fileHandler = require('./app/services/logprocessor/fileHandler')

function formKey(t, id) {
    return ((t.date).replace(/\./g, '_') + '.' + (t.time).replace(/\:/g, '_') + '.' + id).replace(/\s/g, '')
}

function formDate(dateStr) {
    let dParts = dateStr.date.split('.')
    return new Date(dParts[2] + '-' + dParts[1] + '-' + dParts[0] + 'T' + dateStr.time)
}

async function repairBot() {


    global.log.debug(sn + 'Recreating existing files')

    if (fs.existsSync('./app/storage/raw_logs/')) fs.rmdirSync('./app/storage/raw_logs/', {
        recursive: true
    })
    fs.mkdirSync('./app/storage/raw_logs/')
    fs.mkdirSync('./app/storage/raw_logs/new/')

    if (fs.existsSync('./app/storage/logs/')) fs.rmdirSync('./app/storage/logs/', {
        recursive: true
    })
    fs.mkdirSync('./app/storage/logs/')

    let lines = {
        login: {},
        chat: {},
        admin: {},
        kill: {},
        mines: {},
    }

    global.log.debug(sn + 'Connecting to PP-FTP')
    try {
        await ftp_pp.access({
            host: process.env.PP_FTP_HOST,
            port: process.env.PP_FTP_PORT,
            user: process.env.PP_FTP_USER,
            password: process.env.PP_FTP_PASSWORD,
            secure: false
        })
    } catch (error) {
        global.log.debug(sn + error)
        throw new Error(error)
    }


    global.log.debug(sn + 'Getting Log-Files')

    try {
        let files = await (await ftp_pp.list(process.env.PP_FTP_LOG_DIR)).filter(e => {
            if (e['name'].startsWith('violations')) return false
            return true
        }).map(e => {
            return {
                name: e['name'],
                size: e['size']
            }
        })
        let fileAmount = files.length
        for (const file of files) {
            await ftp_pp.downloadTo('./app/storage/raw_logs/new/' + file.name, process.env.PP_FTP_LOG_DIR + '/' + file.name)
            fileAmount = fileAmount - 1
            if (fileAmount % 10 == 0) global.log.debug(sn + 'Remaining: ' + fileAmount)
        }
        ftp_pp.close()
    } catch (error) {
        global.log.debug(sn + error)
        throw new Error(error)
    }

    global.log.debug(sn + 'Log-Files downloaded')
    global.log.debug(sn + 'Getting Log-Cache from RM_LOG_FTP')
    global.log.debug(sn + 'Connecting to RM_LOG_FTP')
    try {

        await ftp_rm.access({
            host: process.env.RM_LOG_FTP_HOST,
            port: process.env.RM_LOG_FTP_PORT,
            user: process.env.RM_LOG_FTP_USER,
            password: process.env.RM_LOG_FTP_PASSWORD,
            secure: true
        })

        for (const key in lines)
            await ftp_rm.downloadTo('./app/storage/logs/' + key + '.json', process.env.RM_LOG_FTP_DIR + key + '.json')

    } catch (error) {
        global.log.debug(sn + error)
        throw new Error(sn + 'Error: ' + error)
    }

    global.log.debug(sn + 'Log-Cache downloaded. Processing files...')

    try {
        for (const key in lines)
            lines[key] = JSON.parse(fs.readFileSync('./app/storage/logs/' + key + '.json'))
    } catch (err) {
        global.log.debug(sn + error)
        throw new Error(sn + 'Error: ' + error)
    }

    global.log.debug(sn + 'Files processed')

    global.log.debug(sn + 'Merging Cache with PP-Data')
    for (const key in lines) lines[key] = {
        ...lines[key],
        ...await fileHandler.getLines(key)
    }


    global.log.debug(sn + 'Fixing login-logs')

    onlineLines = {}
    for (const line in lines.login) {
        if (lines.login[line].type == 'login') onlineLines[line.userID] = {
            ...lines.login[line]
        }
        else if (onlineLines[line.userID]) delete onlineLines[line.userID]
    }

    let lastRestart = new Date()
    let curHour = lastRestart.getHours()
    if (curHour < 6) lastRestart.setHours(0, 1, 0, 0)
    else if (curHour < 12) lastRestart.setHours(6, 1, 0, 0)
    else if (curHour < 18) lastRestart.setHours(12, 1, 0, 0)
    else if (curHour > 18) lastRestart.setHours(18, 1, 0, 0)
    restartTime = lastRestart.getTime()
    for (const el in global.playerlist) {
        if (global.playerlist[el].online) {

            loginDate = formDate(global.playerlist[el].time)
            if (loginDate.getTime() > restartTime) continue

            loginDate.setSeconds(loginDate.getSeconds() + 5)
            newEntryTime = loginDate.getHours() + ':' + loginDate.getMinutes() + ':' + loginDate.getSeconds()
            newEntryKey = formKey({
                date: global.playerlist[el].time.date,
                time: newEntryTime
            }, global.playerlist[el].userID)

            lines.login[newEntryKey] = {
                ...global.playerlist[el]
            }
            lines.login[newEntryKey].type = 'logout'
            lines.login[newEntryKey].online = false
            lines.login[newEntryKey].time.time = newEntryTime

        }
    }

    global.log.debug(sn + 'Login-logs fixed')

    global.log.debug(sn + 'Writing logs to files')
    for (const key in lines)
        fs.writeFileSync('./app/storage/logs/' + key + '.json', JSON.stringify(lines[key]))

    global.log.debug(sn + 'Uploading fixed Logs to RM_LOG_FTP')
    for (const key in lines)
        await ftp_rm.uploadFrom('./app/storage/logs/' + key + '.json', process.env.RM_LOG_FTP_DIR + key + '.json')



    global.log.debug(sn + 'Uploading backups to RM_LOG_FTP')
    backupDir = 'backup_' + new Date().getTime() + '/'
    await ftp_rm.ensureDir(process.env.RM_LOG_FTP_DIR + backupDir)
    for (const key in lines)
        await ftp_rm.uploadFrom('./app/storage/logs/' + key + '.json', process.env.RM_LOG_FTP_DIR + backupDir + key + '.json')

    ftp_rm.close()

    return true
}


repairBot()