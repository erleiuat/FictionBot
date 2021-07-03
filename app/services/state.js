const request = require('request')
const sn = global.chalk.green('[State] -> ')

let updateTimer = 300
let serverTime = false

/*
async function checkOnline() {
    do {
        await global.sleep.timer(1)
        if (global.updates) continue
        let tmpOnline = 0
        for (const e in global.playerlist) {
            if (global.playerlist[e].online) tmpOnline++
        }
        online = tmpOnline
    } while (true)
}
*/

async function checkTime() {
    let timeCache = ''
    do {
        await global.sleep.timer(1)
        updateTimer++
        if (updateTimer < 300) continue
        updateTimer = 0
        request({
            'url': process.env.BATTLEMETRICS_URL
        }, (error, response) => {
            if (error) console.log(sn + 'Error: ' + error)
            else {
                try {
                    let data = (JSON.parse(response.body))
                    if (data.data && timeCache != data.data.attributes.details.time) {
                        // Load from Battlemetrics
                        global.playersOnline = data.data.attributes.players
                        timeCache = data.data.attributes.details.time
                        serverTime = data.data.attributes.details.time
                        console.log(sn + 'Server-time updated')
                    }
                } catch (e) {
                    serverTime = false
                    console.log(sn + 'Unable to read Server-Status: ' + e)
                }
            }
        })
    } while (true)
}

async function incrementTime() {
    do {
        await global.sleep.timer(1 / process.env.GS_TIMEOFDAYSPEED)
        if (!serverTime) continue
        try {
            let parts = serverTime.split(':')
            parts[2] = parseInt(parts[2]) + 1

            if (parts[2] >= 60) {
                parts[1] = parseInt(parts[1]) + 1
                parts[2] = 0
            }
            if (parseInt(parts[1]) >= 60) {
                parts[0] = parseInt(parts[0]) + 1
                parts[1] = 0
            }
            if (parseInt(parts[0]) >= 24) parts[0] = 0
            serverTime = global.nZero.form(parseInt(parts[0])) + ':' + global.nZero.form(parseInt(parts[1])) + ':' + global.nZero.form(parseInt(parts[2]))
        } catch (error) {
            console.log(sn + 'Error: ' + error)
        }
    } while (true)
}

exports.start = async function start(dcClient) {

    //checkOnline()
    checkTime()
    incrementTime()
    let msgCache = ''
    let onlineCache = 0

    do {
        await global.sleep.timer(1)
        if (global.updates) continue
        if (global.updatingFTP) continue
        if (onlineCache != global.playersOnline) {
            onlineCache = global.playersOnline
            updateTimer = 0
        }

        let msg = onlineCache + ' 👥'
        if (serverTime) {
            global.ingameTime = serverTime.slice(0, -3)
            msg += ' | ' + serverTime.slice(0, -3) + ' 🕒'
        }
        if (msg == msgCache) continue
        dcClient.user.setActivity(msg, {
            type: 'WATCHING'
        })
        msgCache = msg
    } while (true)

}