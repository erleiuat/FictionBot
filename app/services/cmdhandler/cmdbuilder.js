let actCmds = []
let lastDone = {}


exports.getTmpCmd = function getTmpCmd() {
    let d = new Date()
    return {
        time: {
            date: global.nZero.form(d.getDate()) + '.' + global.nZero.form((d.getMonth() + 1)) + '.' + d.getFullYear(),
            time: global.nZero.form(d.getHours()) + ':' + global.nZero.form(d.getMinutes()) + ':' + global.nZero.form(d.getSeconds())
        }
    }
}


exports.begin = function begin(cmd, allowScope) {
    actCmds = []
    if (allowScope && cmd.type.toLowerCase() != allowScope) return false
    return true
}


exports.addMessage = function addMessage(scope, msg) {
    if (actCmds[actCmds.length - 1] && actCmds[actCmds.length - 1]['messages']) actCmds[actCmds.length - 1]['messages'].push({
        scope: scope,
        message: msg
    })
    else actCmds.push({
        messages: [{
            scope: scope,
            message: msg
        }]
    })
}

exports.addAction = function addAction(action, acteurs = true) {
    if (actCmds[actCmds.length - 1] && actCmds[actCmds.length - 1]['actions']) actCmds[actCmds.length - 1]['actions'].push({
        type: action,
        properties: acteurs
    })
    else actCmds.push({
        actions: [{
            type: action,
            properties: acteurs
        }]
    })
}

exports.fullCommand = function fullCommand(cmd, type = 'global') {
    let fCmd = {
        date: cmd.time.date,
        time: cmd.time.time,
        type: type,
        commands: [...actCmds]
    }
    actCmds = []
    return fCmd
}

exports.tooEarly = function tooEarly(action, waitMins) {
    let now = new Date().getTime()
    waitMins = waitMins * 60 * 1000
    if (lastDone[action] && lastDone[action] > now - waitMins) {
        let waitFor = Math.round((waitMins - (now - lastDone[action])) / 1000 / 60)
        this.addMessage('global', 'Sorry, you are too fast. Please wait ' + waitFor + ' minutes.')
        return true
    }
    lastDone[action] = now
    return false
}
