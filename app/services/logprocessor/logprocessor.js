const sn = '[LOGProcessor] -> '
const fs = require('fs')
const ftp = new(require('basic-ftp')).Client()
const fileHandler = require('./fileHandler')
//ftp.ftp.verbose = true

let logCache = null
let updateCounter = 0

exports.start = async function start() {

    logCache = await getCurrentCache({
        kill: {},
        chat: {},
        admin: {},
        login: {},
        mines: {}
    })

    updateFTPCache()

    do {
        await global.sleep.timer(0.01)
        if (!global.updates) continue
        if (global.updatingFTP) continue

        let logs = {
            mines: {},
            chat: {},
            admin: {},
            login: {},
            kill: {}
        }

        global.log.debug(sn + 'Processing new Data')

        for (const logtype in logs) {

            logs[logtype] = await fileHandler.getLines(logtype)
            for (const key in logs[logtype]) {
                if (!(key in logCache[logtype])) {
                    updateCounter = 0
                    global.newEntries[logtype][key] = logs[logtype][key]
                    global.log.debug(sn + 'Added new Entry for processing. (' + logtype + ')')
                } else delete logs[logtype][key]
            }

            logCache[logtype] = {
                ...logCache[logtype],
                ...logs[logtype]
            }

            fs.writeFileSync('./app/storage/logs/' + logtype + '.json', JSON.stringify(logCache[logtype]))

        }

        global.log.debug(sn + 'Processing done')

        global.updates = false
    } while (true)

}


async function updateFTPCache() {
    let lastCache = null

    do {
        await global.sleep.timer(1)
        updateCounter++
        if (global.updates) continue
        if (updateCounter < 15) continue
        global.updatingFTP = true
        updateCounter = 0

        global.log.debug(sn + 'Updating FTP-Log-Cache')
        if (JSON.stringify(logCache) == lastCache) {
            global.log.debug(sn + 'Nothing to update')
            global.updatingFTP = false
            continue
        }

        try {

            await ftp.access({
                host: process.env.RM_LOG_FTP_HOST,
                port: process.env.RM_LOG_FTP_PORT,
                user: process.env.RM_LOG_FTP_USER,
                password: process.env.RM_LOG_FTP_PASSWORD,
                secure: true
            })

            for (const key in logCache) await ftp.uploadFrom('./app/storage/logs/' + key + '.json', process.env.RM_LOG_FTP_DIR + key + '.json')

            lastCache = JSON.stringify(logCache)

        } catch (error) {
            global.log.debug(sn + error)
        }

        ftp.close()

        global.log.debug(sn + 'FTP-Log-Cache update complete')
        global.updatingFTP = false
    } while (true)


}

async function getCurrentCache(logTypes) {
    global.log.debug(sn + 'Getting Log-Cache')

    try {
        await ftp.access({
            host: process.env.RM_LOG_FTP_HOST,
            port: process.env.RM_LOG_FTP_PORT,
            user: process.env.RM_LOG_FTP_USER,
            password: process.env.RM_LOG_FTP_PASSWORD,
            secure: true
        })
        for (const key in logTypes) await ftp.downloadTo('./app/storage/logs/' + key + '.json', process.env.RM_LOG_FTP_DIR + key + '.json')
    } catch (error) {
        global.log.debug(sn + error)
        throw new Error(sn + 'Error: ' + error)
    }

    ftp.close()
    let cacheContent = {}
    for (const key in logTypes) cacheContent[key] = JSON.parse(fs.readFileSync('./app/storage/logs/' + key + '.json'))
    global.log.debug(sn + 'Log-Cache loaded')
    return cacheContent

}