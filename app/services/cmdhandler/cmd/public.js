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
  '/fasttravel': 'travel',
  '/travel': 'travel'
}

async function getJoke() {
  return new Promise(resolve => {
    request.get(
      {
        url: 'https://api.api-ninjas.com/v1/jokes?limit=1',
        headers: {
          'X-Api-Key': '7wk74FwsQHrQj9A6JgE1FA==5uxpvXNNabi4lflP'
        }
      },
      (error, response, body) => {
        if (error) return console.error('Request failed:', error)
        else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'))
        else resolve(JSON.parse(body)[0]['joke'])
      }
    )
  })
}

exports.travel = async function travel(cmd) {
  cmdBuilder.begin()
  let target = false
  let station = cmd.message.toLowerCase().replace('/travel', '').replace('/fasttravel', '').trim()
  if (station == 'd0') target = '#Teleport -669327 387796 72675'
  else if (station == 'b2') target = '#Teleport -116775 -66744 37065'
  else if (station == 'z0') target = '#Teleport -829491 -837658 5690'
  else if (station == 'a3') target = '#Teleport 101034 -492350 9982'
  else if (station == 'd4') target = '#Teleport 430079 477843 10546'
  else if (station == 'stations') {
    cmdBuilder.addMessage('global', global.bot.pub.travel.stations.replace('{user}', cmd.user))
    return cmdBuilder.fullCommand(cmd)
  } else {
    cmdBuilder.addMessage('global', global.bot.pub.travel.unknownLoc.replace('{user}', cmd.user))
    return cmdBuilder.fullCommand(cmd)
  }

  cmdBuilder.addAction('travel', {
    steamID: cmd.steamID,
    target: target + ' ' + cmd.steamID,
    costs: 10,
    stations: [
      [-669327, 387796, 1000, 1000],
      [-116775, -66744, 1000, 1000],
      [-829491, -837658, 1000, 1000],
      [101034, -492350, 1000, 1000],
      [430079, 477843, 1000, 1000]
    ],
    messages: {
      notEnough: global.bot.pub.travel.notEnough.replace('{user}', cmd.user),
      noStation: global.bot.pub.travel.noStation.replace('{user}', cmd.user),
      start: global.bot.pub.travel.start.replace('{user}', cmd.user),
      somethingWrong: global.bot.pub.travel.somethingWrong.replace('{user}', cmd.user)
    }
  })
  return cmdBuilder.fullCommand(cmd)
}

exports.vote_night = async function vote_night(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  if (cmdBuilder.tooEarly('vote_night', 5)) return cmdBuilder.fullCommand(cmd)

  cmdBuilder.addMessage('global', global.bot.pub.vote.night)
  cmdBuilder.addMessage('global', '#vote SetTimeOfDay 22')
  return cmdBuilder.fullCommand(cmd)
}

exports.help = async function help(cmd) {
  cmdBuilder.begin()
  cmdBuilder.addMessage('global', global.bot.pub.help.m1.replace('{user}', cmd.user))
  cmdBuilder.addMessage('global', global.bot.pub.help.m2)
  cmdBuilder.addMessage('global', global.bot.pub.help.m3)
  cmdBuilder.addMessage('global', global.bot.pub.help.m4)
  return cmdBuilder.fullCommand(cmd)
}

exports.joke = async function joke(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  if (cmdBuilder.tooEarly('joke', 5)) return cmdBuilder.fullCommand(cmd)

  let joke = await getJoke()
  while (joke.length > 195) joke = await getJoke()
  cmdBuilder.addMessage('global', global.bot.pub.joke.replace('{joke}', joke))
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

  cmdBuilder.addMessage('global', global.bot.pub.vote.sun)
  cmdBuilder.addMessage('global', '#vote SetWeather 0')
  return cmdBuilder.fullCommand(cmd)
}

exports.vote_day = async function vote_day(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  if (cmdBuilder.tooEarly('vote_day', 5)) return cmdBuilder.fullCommand(cmd)

  cmdBuilder.addMessage('global', global.bot.pub.vote.day)
  cmdBuilder.addMessage('global', '#vote SetTimeOfDay 7')
  return cmdBuilder.fullCommand(cmd)
}

exports.ping = async function ping(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null

  cmdBuilder.addMessage('global', global.bot.pub.ping.replace('{user}', cmd.user))
  return cmdBuilder.fullCommand(cmd)
}

exports.online = async function online(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null

  cmdBuilder.addMessage('global', global.bot.pub.online.replace('{players}', global.playersOnline))
  return cmdBuilder.fullCommand(cmd)
}

exports.time = async function time(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null

  let time = '<unavailable>'
  if (global.ingameTime) time = global.ingameTime
  cmdBuilder.addMessage('global', global.bot.pub.time.replace('{time}', time))
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

  cmdBuilder.addMessage('global', global.bot.pub.restart.replace('{minutes}', minutes).replace('{hours}', hours))
  return cmdBuilder.fullCommand(cmd)
}
