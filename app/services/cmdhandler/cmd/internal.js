const cmdBuilder = require('../cmdbuilder')

exports.console_msg = async function console_msg(cmd) {
  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()

  cmdBuilder.addMessage('global', '#SetFakeName ' + cmd.user)
  let cmds = cmd.content.split(';')
  for (const cmd of cmds) cmdBuilder.addMessage('global', cmd.trim())
  cmdBuilder.addMessage('global', global.bot.fName)

  return cmdBuilder.fullCommand(tmpCmd)
}

exports.mine_armed = async function mine_armed(cmd) {
  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()
  cmdBuilder.addMessage('global', global.bot.in.traps)
  return cmdBuilder.fullCommand(tmpCmd)
}

exports.spawn = async function spawn(cmd) {
  cmd.message = global.bot.pos.outside + '; ' + cmd.message.replace('/spawn', '').trim()
  return await this.exec(cmd)
}

exports.exec = async function exec(cmd) {
  aList = await global.admins.list()
  if (!cmd.steamID || !aList[cmd.steamID]) return null

  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()
  cmdBuilder.addMessage('global', '#SetFakeName ' + cmd.user)

  let msgCmds = cmd.message
    .toLowerCase()
    .replace('/exec', '')
    .split(';')
    .map(s => s.trim())

  for (const el of msgCmds) {
    let command = el.split(' ')[0].toLowerCase().trim()
    if (aList[cmd.steamID].canExecute[command] || aList[cmd.steamID].canExecute['#*']) cmdBuilder.addMessage('global', el)
  }

  cmdBuilder.addMessage('global', global.bot.fName)
  cmdBuilder.addMessage('global', global.bot.pos.idle)
  return cmdBuilder.fullCommand(tmpCmd)
}

exports.sk_legal = async function sk_legal(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  cmdBuilder.addMessage('global', global.bot.in.sKit.start1.replace('{user}', cmd.user))
  cmdBuilder.addMessage('global', global.bot.in.sKit.start2)
  return cmdBuilder.fullCommand(cmd)
}

exports.sk_ready = async function sk_ready(cmd, updateFunction) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  cmdBuilder.addMessage('global', global.bot.in.sKit.start3.replace('{user}', cmd.user))
  cmdBuilder.addMessage('global', global.bot.pPos.inside.replace('{userID}', cmd.steamID))
  cmdBuilder.addMessage('global', global.bot.pos.idle)
  cmdBuilder.addMessage('global', '#SpawnItem Backpack_01_07')
  cmdBuilder.addMessage('global', '#SpawnItem MRE_Stew 2')
  cmdBuilder.addMessage('global', '#SpawnItem MRE_CheeseBurger 2')
  cmdBuilder.addMessage('global', '#SpawnItem MRE_TunaSalad 2')
  cmdBuilder.addMessage('global', '#SpawnItem Milk 2')
  cmdBuilder.addMessage('global', '#SpawnItem Canteen 2')
  cmdBuilder.addMessage('global', '#SpawnItem Emergency_Bandage_Big')
  cmdBuilder.addMessage('global', '#SpawnItem Painkillers_03')
  cmdBuilder.addMessage('global', '#SpawnItem Vitamins_03')
  cmdBuilder.addMessage('global', '#SpawnItem BP_Compass_Advanced')
  cmdBuilder.addMessage('global', '#SpawnItem 1H_Small_Axe')
  cmdBuilder.addMessage('global', '#SpawnItem 2H_Baseball_Bat_With_Wire')
  cmdBuilder.addMessage('global', '#SpawnItem Car_Repair_Kit')
  cmdBuilder.addMessage('global', '#SpawnItem Lock_Item_Basic')
  cmdBuilder.addMessage('global', '#SpawnItem Lock_Item_Advanced')
  cmdBuilder.addMessage('global', global.bot.pos.outside)
  cmdBuilder.addMessage('global', '#SpawnVehicle BP_Quad_01_A')
  cmdBuilder.addMessage('local', global.bot.in.sKit.done.replace('{user}', cmd.user))
  cmdBuilder.addMessage('global', global.bot.pos.idle)
  return cmdBuilder.fullCommand(cmd)
}

exports.sk_illegal = async function sk_illegal(cmd) {
  if (!cmdBuilder.begin(cmd, 'global')) return null
  cmdBuilder.addMessage('global', global.bot.in.sKit.illegal.replace('{user}', cmd.user))
  return cmdBuilder.fullCommand(cmd)
}

exports.welcome_new = async function welcome_new(cmd) {
  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()
  cmdBuilder.addMessage('global', global.bot.pPos.firstJoin.replace('{userID}', cmd.steamID))
  cmdBuilder.addMessage('global', global.bot.in.firstJoin.fPoints.replace('{userID}', cmd.steamID))
  cmdBuilder.addMessage('global', global.bot.in.firstJoin.welcome.replace('{user}', cmd.user))
  return cmdBuilder.fullCommand(tmpCmd)
}

exports.auth_log = async function auth_log(cmd) {
  cmdBuilder.begin()
  cmdBuilder.addMessage('global', global.bot.in.auth.replace('{user}', cmd.user).replace('{msg}', cmd.text))
  return cmdBuilder.fullCommand(cmd)
}

exports.kill_feed = async function kill_feed(cmd) {
  cmdBuilder.begin()
  cmdBuilder.addMessage('global', global.bot.in.kill.replace('{user1}', cmd.killer).replace('{user2}', cmd.victim))
  return cmdBuilder.fullCommand(cmd)
}
