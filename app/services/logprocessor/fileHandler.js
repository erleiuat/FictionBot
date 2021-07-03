const fs = require('fs')
const iconv = require('iconv-lite')
const regexname = /\(([^)]+)\).*/gm
const sn = global.chalk.magenta('[LOGProcessor] -> ')
const playerlist = {}

exports.getLines = async function getLines(type) {

    let files = fs.readdirSync('./app/storage/raw_logs/new/')
    let lines = {}

    for (const file of files) {
        if (file.startsWith(type)) {
            if (type == 'kill') lines = {
                ...lines,
                ...await kill(file)
            }
            else if (type == 'chat') lines = {
                ...lines,
                ...await chat(file)
            }
            else if (type == 'admin') lines = {
                ...lines,
                ...await admin(file)
            }
            else if (type == 'login') lines = {
                ...lines,
                ...await login(file)
            }
            else if (type == 'mines') lines = {
                ...lines,
                ...await mines(file)
            }
            else return false
        }
    }

    return lines

}

async function mines(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    let i = 0

    for (const line of lines) {
        i++
        let t = formTime(line)
        let steamID = line.substring(22, 39)
        let key = formKey(t, steamID) + '.' + i
        let userID = line.slice(40).match(regexname)
        let user = line.slice(40).replace(userID, '')

        let owner = null
        let location = 'unknown'
        let actionType = 'unknown'
        if (line.includes(')\' armed trap ')) actionType = 'armed'
        else if (line.includes(')\' disarmed trap ')) actionType = 'disarmed'
        else if (line.includes(')\' crafted trap ')) actionType = 'crafted'
        else if (line.includes(')\' triggered trap ')) {
            actionType = 'triggered'
            let ownInfo = line.split(') from ')[1]
            let ownSteamID = ownInfo.split(':')[0]
            let ownUserID = ownInfo.split(':')[1].match(regexname)
            let ownUser = ownInfo.split(':')[1].replace(ownUserID, '')
            owner = {
                steamID: ownSteamID,
                user: ownUser
            }
        }

        if (line.includes('on location(')) {
            location = line.substring(line.indexOf('on location(') + 11)
            location = location.substring(0, location.indexOf(')') + 1).trim()
        }

        formatted[key] = {
            time: t,
            user: user,
            steamID: steamID,
            action: actionType,
            location: location,
            owner: owner
        }

    }

    return formatted

}

async function chat(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    let i = 0

    for (const line of lines) {
        i++
        let t = formTime(line)
        let steamID = line.substring(22, 39)
        let key = formKey(t, steamID) + '.' + i
        let msg = line.substring(line.indexOf('\' \'') + 1).slice(2, -1)
        let msgType = msg.slice(0, msg.indexOf(':'))
        msg = msg.substring(msg.indexOf(':') + 1)
        let userID = line.slice(40).match(regexname)
        let user = line.slice(40).replace(userID, '')

        formatted[key] = {
            time: t,
            user: user,
            steamID: steamID,
            type: msgType.trim(),
            message: msg.trim()
        }

    }

    return formatted
}

async function admin(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    let i = 0

    for (const line of lines) {
        i++
        let t = formTime(line)
        let steamID = line.substring(22, 39)
        let key = formKey(t, steamID) + '.' + i
        let msg = line.substring(line.indexOf('\' C')).slice(2, -1)
        let msgType = msg.slice(0, msg.indexOf(':'))
        msg = '#' + msg.substring(msg.indexOf(': \'') + 3)
        let userID = line.slice(40).match(regexname)
        let user = line.slice(40).replace(userID, '')

        formatted[key] = {
            time: t,
            user: user,
            steamID: steamID,
            type: msgType,
            message: msg
        }

    }

    return formatted
}

async function login(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    let i = 0

    for (const line of lines) {
        let t = formTime(line)
        i++

        if (line.includes('logged in')) {

            let ip = line.slice(22, line.substring(22).indexOf(' ') + 22)
            let steamID = line.slice(line.indexOf(ip) + ip.length + 1, line.indexOf(ip) + ip.length + 18)
            let userID = line.substring(line.indexOf(ip) + ip.length + 19).match(regexname)
            let user = line.substring(line.indexOf(ip) + ip.length + 19).replace(userID, '')
            userID = userID[0].slice(userID[0].indexOf('(') + 1, userID[0].indexOf(')'))
            let key = formKey(t, userID) + '.' + i

            formatted[key] = {
                type: 'login',
                steamID: steamID,
                userID: userID,
                user: user,
                drone: line.includes('(as drone)'),
                time: t,
                ip: ip,
                online: true
            }

            global.playerlist[userID] = formatted[key]

        } else {

            let userID = line.slice(22, line.indexOf('\' logging out'))
            let key = formKey(t, userID) + '.' + i
            formatted[key] = {
                type: 'logout',
                steamID: global.playerlist[userID].steamID,
                userID: userID,
                user: global.playerlist[userID].user,
                time: t,
                ip: global.playerlist[userID].ip,
                online: false
            }

            global.playerlist[userID] = formatted[key]

        }

    }

    return formatted
}

async function kill(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    let i = 0



    for (const line of lines) {
        if (!line.slice(21, 30).startsWith('{')) continue
        i++
        let t = formTime(line)
        let content = JSON.parse(line.slice(21))
        let key = formKey(t, content.Victim.UserId) + '.' + i
        let distance = 0
        if (content.Killer && content.Killer.ServerLocation.X && content.Victim.ServerLocation.X) {
            var dx = content.Killer.ServerLocation.X - content.Victim.ServerLocation.X
            var dy = content.Killer.ServerLocation.Y - content.Victim.ServerLocation.Y
            var dz = content.Killer.ServerLocation.Z - content.Victim.ServerLocation.Z
            var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2))
            distance = Math.round(dist / 100)
        }
        content.time = t
        formatted[key] = {
            ...content,
            distance: distance
        }
    }

    return formatted
}

async function getContent(file) {
    let content = fs.readFileSync('./app/storage/raw_logs/new/' + file)
    await fs.rename('./app/storage/raw_logs/new/' + file, './app/storage/raw_logs/' + file, (error) => {
        if (error) console.log(sn + 'Error: ' + error)
    })
    return iconv.decode(new Buffer.from(content), 'utf16le')
}

async function formLines(content) {
    let lines = []
    let tmpLines = content.split(/\r?\n/)
    for (const line of tmpLines) {
        if (line.length < 5) continue
        if (line.slice(20, 35).includes('Game version')) continue
        lines.push(line)
    }
    return lines
}

function formTime(line) {
    let date = line.substring(0, 10).replace(/\./g, '-')
    let time = line.substring(11, 19).replace(/\./g, ':')
    let d = new Date(date + 'T' + time)
    d.setHours(d.getHours() + 2)
    return {
        date: global.nZero.form(d.getDate()) + '.' + global.nZero.form((d.getMonth() + 1)) + '.' + d.getFullYear(),
        time: global.nZero.form(d.getHours()) + ':' + global.nZero.form(d.getMinutes()) + ':' + global.nZero.form(d.getSeconds())
    }
}

function formKey(t, id) {
    return ((t.date).replace(/\./g, '_') + '.' + (t.time).replace(/\:/g, '_') + '.' + id).replace(/\s/g, '')
}

/*
async function violations(file) {
    let content = await getContent(file)
    let lines = await formLines(content)
    let formatted = {}
    for (const line of lines) {
        if (!line.slice(21, 30).startsWith('{')) continue
        let t = formTime(line)
        let content = JSON.parse(line.slice(21))
        let key = formKey(t, content.Victim.UserId)
        content.time = t
        formatted[key] = content
    }
    return formatted
}
*/