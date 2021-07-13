const sn = '[CMD-Handler] -> '
const fs = require('fs')
const ftp = new (require('basic-ftp').Client)()
const messages = require('./messages').list
const cmdsPublic = require('./cmd/public')
const cmdsInternal = require('./cmd/internal')
const cmdsShop = require('./cmd/shop')
const action = require('./actions')
const bot = require('../../gamebot/gamebot')
let hasStarterkit = []
let checkCounter = 0

function isReady() {
  if (global.newCmds) return false
  if (global.updates) return false
  if (!global.gameReady) return false
  if (global.updatingFTP) return false
  return true
}

exports.start = async function start() {
  //cmdHandler()
  //return
  let botState = await bot.start()

  if (botState.status == 'error') {
    global.log.debug('Gambot status in error!')
    if (botState.data) global.log.debug('Status checked. Chat = ' + resp.data.chat + ', Inventory = ' + resp.data.inventory)
    global.gameReady = false
  } else {
    await bot.messages([
      {
        scope: 'global',
        message: global.bot.fName
      },
      {
        scope: 'global',
        message: '#ListAnimals'
      },
      {
        scope: 'global',
        message: global.bot.pos.idle
      },
      {
        scope: 'global',
        message: '#ShowOtherPlayerInfo true'
      },
      {
        scope: 'global',
        message: global.bot.start.ready
      }
    ])
    global.gameReady = true
  }

  global.newCmds = false
  global.commands = {}
  cmdHandler()
  announce()
  getMap()
}

async function cmdHandler() {
  do {
    await global.sleep.timer(0.005)
    if (!isReady()) continue
    if (Object.keys(global.commands).length < 1) continue
    global.newCmds = true

    for (const e in global.commands) {
      let cmd = {
        ...global.commands[e]
      }
      delete global.commands[e]
      let cmdStart = cmd.message.split(' ')[0].toLowerCase()
      global.log.debug(sn + 'Processing command: ' + cmdStart)

      if (cmdsPublic.list[cmdStart]) await bot.execute(await cmdsPublic[cmdsPublic.list[cmdStart]](cmd))
      else if (cmdStart == '/ready') await tReady(cmd)
      else if (cmdStart == '/starterkit') await tStarterkit(cmd)
      else if (cmdStart == '/exec') await bot.execute(await cmdsInternal['exec'](cmd))
      else if (cmdStart == '/spawn') await bot.execute(await cmdsInternal['spawn'](cmd))
      else if (cmdStart == '/buyitem') await bot.execute(await cmdsShop['shop_item'](cmd))
      else if (cmdStart == '/transfer') await bot.execute(await cmdsShop['transfer'](cmd))
      else if (cmdStart == 'welcome_new') await bot.execute(await cmdsInternal['welcome_new'](cmd))
      else if (cmdStart == 'console_msg') await bot.execute(await cmdsInternal['console_msg'](cmd))
      else if (cmdStart == 'kill_feed') await bot.execute(await cmdsInternal['kill_feed'](cmd))
      else if (cmdStart == 'auth_log') await bot.execute(await cmdsInternal['auth_log'](cmd))
      else if (cmdStart == 'mine_armed') await bot.execute(await cmdsInternal['mine_armed'](cmd))
      else global.log.debug(sn + 'Unknown command: ' + cmdStart)
    }

    global.newCmds = false
  } while (true)
}

async function getMap() {
  do {
    await global.sleep.timer(150)
    if (!isReady()) continue
    global.newCmds = true

    global.log.debug(sn + 'Getting current player positions')
    let imgInfo = await bot.execute(await action.doAct('mapshot', true))

    global.newCmds = false
    if (!imgInfo.data) {
      global.log.debug(sn + 'No image info received')
      continue
    }

    try {
      let d = new Date()
      global.newEntries.maps[imgInfo.fileName] = {
        ...imgInfo.data,
        time: {
          date: global.nZero.form(d.getDate()) + '.' + global.nZero.form(d.getMonth() + 1) + '.' + d.getFullYear(),
          time: global.nZero.form(d.getHours()) + ':' + global.nZero.form(d.getMinutes()) + ':' + global.nZero.form(d.getSeconds())
        }
      }
      global.log.debug(sn + 'Added map for processing')
    } catch (error) {
      global.log.debug(sn + 'Error: ' + error)
    }
  } while (true)
}

async function ftpCon() {
  try {
    await ftp.access({
      host: process.env.RM_CMD_FTP_HOST,
      port: process.env.RM_CMD_FTP_PORT,
      user: process.env.RM_CMD_FTP_USER,
      password: process.env.RM_CMD_FTP_PASSWORD,
      secure: true
    })
  } catch (error) {
    throw new Error(error)
  }
}

async function loadStatus(file) {
  try {
    await ftpCon()
    await ftp.downloadTo('./app/storage/' + file, process.env.RM_CMD_FTP_DIR + file)
    ftp.close()
    return JSON.parse(fs.readFileSync('./app/storage/' + file))
  } catch (error) {
    throw new Error(error)
  }
}

async function receivesStarterkit(steamID, name) {
  try {
    hasStarterkit = await loadStatus('starterkits.json')
    hasStarterkit[steamID] = {
      name: name,
      stamp: new Date().getTime()
    }
    fs.writeFileSync('./app/storage/starterkits.json', JSON.stringify(hasStarterkit))
    await ftpCon()
    await ftp.uploadFrom('./app/storage/starterkits.json', process.env.RM_CMD_FTP_DIR + 'starterkits.json')
  } catch (error) {
    throw new Error(error)
  }
}

async function tStarterkit(cmd) {
  if (cmd.type.toLowerCase() != 'global') return null
  hasStarterkit = await loadStatus('starterkits.json')
  if (!hasStarterkit[cmd.steamID]) return await bot.execute(await cmdsInternal['sk_legal'](cmd))
  else return await bot.execute(await cmdsInternal['sk_illegal'](cmd))
}

async function tReady(cmd) {
  hasStarterkit = await loadStatus('starterkits.json')
  if (!hasStarterkit[cmd.steamID]) {
    let resp = await bot.execute(await cmdsInternal['sk_ready'](cmd))
    if (!resp.error) receivesStarterkit(cmd.steamID, cmd.user)
    return resp
  } else return await bot.execute(await cmdsInternal['sk_illegal'](cmd))
}

async function announce() {
  do {
    await global.sleep.timer(10)

    let now = new Date()
    let time = now.getHours() + ':' + now.getMinutes()
    if (messages[time]) {
      if (messages[time].done) continue
      global.newCmds = true
      await bot.execute({
        commands: [
          {
            messages: [
              {
                scope: 'global',
                message: messages[time].text
              }
            ]
          }
        ]
      })
      global.newCmds = false
      messages[time].done = true
    } else {
      for (const e in messages) {
        messages[e].done = false
      }
    }
  } while (true)
}
