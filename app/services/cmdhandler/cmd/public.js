const request = require('request')
const cmdBuilder = require('../cmdbuilder')


exports.list = {
    '/voteday': 'vote_day',
    '/dayvote': 'vote_day',
    '/votenight': 'vote_night',
    '/votesun': 'vote_weather_sun',
    '/sunvote': 'vote_weather_sun',
    '/voteweather': 'vote_weather_sun',
    '/weathervote': 'vote_weather_sun',
    '/ping': 'ping',
    '/pong': 'ping',
    '/online': 'online',
    '/players': 'online',
    '/playersonline': 'online',
    '/onlineplayers': 'online',
    '/whenrestart': 'restart_countdown',
    '/restart': 'restart_countdown',
    '/restartwhen': 'restart_countdown',
    '/help': 'help',
    '/commands': 'help',
    '/joke': 'joke',
    '/time': 'time',
    '/what': 'what_is_going_on',
    '/travel': 'travel'
}

async function getJoke() {
    return new Promise(resolve => {
        request.get({
            url: 'https://api.api-ninjas.com/v1/jokes?limit=1',
            headers: {
                'X-Api-Key': '7wk74FwsQHrQj9A6JgE1FA==5uxpvXNNabi4lflP'
            },
        }, (error, response, body) => {
            if (error) return console.error('Request failed:', error)
            else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'))
            else resolve(JSON.parse(body)[0]['joke'])
        })
    })
}

exports.travel = async function travel(cmd) {
    if (cmdBuilder.begin(cmd, 'global')) {
        cmdBuilder.addMessage('global', ':[Travel]: ・ Please make sure to be at an Fasttravel-Station and use this command in LOCAL-Chat like this: /travel STATIONNAME')
        return cmdBuilder.fullCommand(cmd)
    } else if (cmdBuilder.begin(cmd, 'local')) {
        let target = false
        let station = cmd.message.replace('/travel', '').trim().toLowerCase()
        console.log(station)
        if(station == 'd0') target = '#Teleport -669327 387796 72675'
        else if(station == 'b2') target = '#Teleport -111659 -61028 37385'
        else if(station == '') target = ''
        else if(station == '') target = ''
        else {
            cmdBuilder.addMessage('global', ':[Travel]: ・ @'+cmd.user+': I couldn\'t recognize the station you want to go to.')
            return cmdBuilder.fullCommand(cmd)
        }

        cmdBuilder.addAction('travel', {
            steamID: cmd.steamID,
            target: target,
            costs: 10,
            stations: [
                [-111738,-61338, 500, 500],
                [-669617, 387690, 500, 500]
            ],
            message: {
                notEnough: ':[Travel]: ・ @'+cmd.user+': You need to have 10 famepoints for this trip.',
                noStation: ':[Travel]: ・ @'+cmd.user+': You aren\'t near any Fasttravel station.',
                good: ':[Travel]: ・ @'+cmd.user+': Your trip will start shortly. It will cost you 10 famepoints.',
                smthWrong: ':[Travel]: ・ @'+cmd.user+': Something went wrong. Please try again.'
            }
        })
        return cmdBuilder.fullCommand(cmd)
    }
}

exports.vote_night = async function vote_night(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    if (cmdBuilder.tooEarly('vote_night', 5)) return cmdBuilder.fullCommand(cmd)

    cmdBuilder.addMessage('global', ':[Voting]: ・ Nighttime-Voting begins! (10:00 PM)')
    cmdBuilder.addMessage('global', '#vote SetTimeOfDay 22')
    return cmdBuilder.fullCommand(cmd)
}

exports.help = async function help(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null

    cmdBuilder.addMessage('global', ':[Help]: ・ Available commands (if bot is online):')
    cmdBuilder.addMessage('global', ':[Help]: ・ /voteday, /votesun, /online, /restart, /joke, /starterkit, /time')
    cmdBuilder.addMessage('global', ':[Help]: ・ (Will only work in GLOBAL Chat! Press "TAB" to change chatroom)')
    return cmdBuilder.fullCommand(cmd)
}

exports.joke = async function joke(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    if (cmdBuilder.tooEarly('joke', 5)) return cmdBuilder.fullCommand(cmd)

    let joke = await getJoke()
    while (joke.length > 195) joke = await getJoke()
    cmdBuilder.addMessage('global', ':[Joke]: ・ ' + joke)
    return cmdBuilder.fullCommand(cmd)
}

exports.what_is_going_on = async function what_is_going_on(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    cmdBuilder.addMessage('global', ':[Wot]: ・ ...is going on here')
    cmdBuilder.addMessage('global', ':[Wot]: ・ BREKFEST')
    return cmdBuilder.fullCommand(cmd)
}

exports.vote_weather_sun = async function vote_weather_sun(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    if (cmdBuilder.tooEarly('vote_weather_sun', 5)) return cmdBuilder.fullCommand(cmd)

    cmdBuilder.addMessage('global', ':[Voting]: ・ Weather voting begins!')
    cmdBuilder.addMessage('global', '#vote SetWeather 0')
    return cmdBuilder.fullCommand(cmd)
}

exports.vote_day = async function vote_day(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    if (cmdBuilder.tooEarly('vote_day', 5)) return cmdBuilder.fullCommand(cmd)

    cmdBuilder.addMessage('global', ':[Voting]: ・ Daytime-Voting begins! (7:00 AM)')
    cmdBuilder.addMessage('global', '#vote SetTimeOfDay 7')
    return cmdBuilder.fullCommand(cmd)
}

exports.ping = async function ping(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null

    cmdBuilder.addMessage('global', ':[BadaBong]: ・ Pong right back at you @' + cmd.user + ' ;)')
    return cmdBuilder.fullCommand(cmd)
}

exports.online = async function online(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null

    cmdBuilder.addMessage('global', ':[Players]: ・ There are currently ' + global.playersOnline + ' Players online.')
    return cmdBuilder.fullCommand(cmd)
}

exports.time = async function time(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null

    let time = '<unavailable>'
    if (global.ingameTime) time = global.ingameTime
    cmdBuilder.addMessage('global', ':[Time]: ・ It is currently about ' + time + '.')
    return cmdBuilder.fullCommand(cmd)
}

exports.restart_countdown = async function restart_countdown(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null

    let now = new Date()
    let curHour = now.getHours()
    let countDownDate = new Date()
    countDownDate.setMinutes(0)
    if (curHour < 6) countDownDate.setHours(6)
    else if (curHour < 12) countDownDate.setHours(12)
    else if (curHour < 18) countDownDate.setHours(18)
    else if (curHour >= 18) {
        countDownDate.setDate(countDownDate.getDate() + 1)
        countDownDate.setHours(0)
    }

    let distance = countDownDate.getTime() - now.getTime()
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

    cmdBuilder.addMessage('global', ':[Restart]: ・ Next restart will be in: ' + hours + ' hours and ' + minutes + ' minutes.')
    return cmdBuilder.fullCommand(cmd)
}