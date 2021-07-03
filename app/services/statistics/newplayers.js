const fs = require('fs')
const sn = global.chalk.green('[STATISTICS] -> ')

let cache = []

exports.get = async function get() {

    let data = JSON.parse(fs.readFileSync('./app/storage/logs/login.json'))
    let state = {}

    for (const e in data) {

        let key = data[e].steamID
        let time = formDate(data[e].time)

        if (!state[key]) state[key] = {
            user: data[e].user,
            joined: time,
            date: time.getDate() + '.' + (time.getMonth() + 1) + '.' + time.getFullYear()
        }
        else {
            if (state[key].joined.getTime() > time.getTime()) {
                state[key].joined = time
                state[key].date = time.getDate() + '.' + (time.getMonth() + 1) + '.' + time.getFullYear()
            }
        }

    }

    let stateArr = []
    for (const e in state) {
        stateArr.push(state[e])
    }

    if (stateArr.length == cache.length + 1) {
        console.log(sn + 'New Player detected!')
        let newUser = stateArr[stateArr.length - 1]
        let now = new Date().getTime()
        if (newUser.joined.getTime() > now - (2 * 60 * 1000)) {
            global.commands[newUser.user] = {
                message: 'welcome_new',
                ...newUser
            }
        }
    }

    cache = stateArr
    return await formMsg(stateArr)

}

async function formMsg(state) {

    let msgs = []
    state.sort((a, b) => (a.joined.getTime() > b.joined.getTime()) ? 1 : ((b.joined.getTime() > a.joined.getTime()) ? -1 : 0))

    let lastWeek = new Date().getTime() - (6 * 86400 * 1000)
    let newAvg = 0
    let newAvgDays = 0

    let msg = ''
    let curDate = ''
    let countUsers = 0
    for (const user of state) {

        if (msg.length >= 1500) {
            msgs.push(msg)
            msg = ''
        }

        if (curDate != user.date) {
            msg += '\n**Total: ' + countUsers + '**\n\n-----\n\n**New Users from ' + user.date + ':**'
            if (user.joined.getTime() > lastWeek) {
                newAvg += countUsers
                newAvgDays++
            }
            curDate = user.date
            countUsers = 0
        }

        msg += '\n - ' + user.user
        countUsers++

    }

    newAvg += countUsers
    newAvgDays++

    msg += '\n**Total: ' + countUsers + '**\n\n-----'
    msg += '\n**Average: ' + Math.round((newAvg/newAvgDays)*100)/100 + '/day**'
    msg += '\n_last week_'
    msgs.push(msg)
    return msgs

}

function formDate(dateStr) {
    let dParts = dateStr.date.split('.')
    return new Date(dParts[2] + '-' + dParts[1] + '-' + dParts[0] + 'T' + dateStr.time)
}