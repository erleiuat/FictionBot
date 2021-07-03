const fs = require('fs')
const sn = global.chalk.blue('[FTPWatcher] -> ')
const ftp = new(require('basic-ftp')).Client()
const ioCheckSec = global.io.meter({
    name: 'FTP-Checks/Second',
    id: 'app/services/ftpwatcher/checks/volume'
})
const ioTotalReq = io.counter({
    name: 'FTP-Request Total',
    id: 'app/services/ftpwatcher/requests/total'
});

exports.start = async function start() {

    try {
        await ftp.access({
            host: process.env.PP_FTP_HOST,
            port: process.env.PP_FTP_PORT,
            user: process.env.PP_FTP_USER,
            password: process.env.PP_FTP_PASSWORD,
            secure: false
        })
    } catch (error) {
        throw new Error(error)
    }

    console.log(sn + 'FTP-Connection established')
    let fileCache = {}
    let listCache = fs.readdirSync('./app/storage/raw_logs/').filter(e => {
        if (e == 'new') return false
        return true
    }).map(e => {
        return {
            name: e,
            size: fs.statSync('./app/storage/raw_logs/' + e).size
        }
    })

    if (listCache.length >= 1) {
        for (const file of listCache) fileCache[file.name] = file
        listCache = JSON.stringify(listCache)
    }

    let i = 1
    do {
        await global.sleep.timer(0.01)
        if (global.updates) continue
        if (global.updatingFTP) continue
        if (i % 10 == 0) console.log(sn + 'Checking for new updates (#' + i + ')')
        i++

        let files = await (await ftp.list(process.env.PP_FTP_LOG_DIR)).filter(e => {
            if (e['name'].startsWith('violations')) return false
            return true
        }).map(e => {
            return {
                name: e['name'],
                size: e['size']
            }
        })

        ioTotalReq.inc()
        ioCheckSec.mark()
        if (JSON.stringify(files) == listCache) continue
        console.log(sn + 'New Updates found! (#' + i + ') Downloading files...')

        for (const file of files) {
            if (fileCache[file.name] && fileCache[file.name].size == file.size) continue
            await ftp.downloadTo('./app/storage/raw_logs/new/' + file.name, process.env.PP_FTP_LOG_DIR + '/' + file.name)
            fileCache[file.name] = file
            ioTotalReq.inc()
        }

        listCache = JSON.stringify(files)
        console.log(sn + 'File-Download complete!')
        global.updates = true
    } while (true)

}