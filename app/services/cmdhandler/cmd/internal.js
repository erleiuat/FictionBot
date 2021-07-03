const cmdBuilder = require('../cmdbuilder')

exports.console_msg = async function console_msg(cmd) {
    cmdBuilder.begin()
    let tmpCmd = cmdBuilder.getTmpCmd()

    cmdBuilder.addMessage('global', '#SetFakeName ' + cmd.user)
    let cmds = cmd.content.split(';')
    for (const cmd of cmds) cmdBuilder.addMessage('global', cmd.trim())
    cmdBuilder.addMessage('global', '#SetFakeName [SF-BOT]')

    return cmdBuilder.fullCommand(tmpCmd)
}

exports.mine_armed = async function mine_armed(cmd) {
    cmdBuilder.begin()
    let tmpCmd = cmdBuilder.getTmpCmd()
    cmdBuilder.addMessage('global', '[MINE]: If you have just placed a mine, please note that this is only allowed in and immediately around your Base. Remove the mine if this is not the case.')
    return cmdBuilder.fullCommand(tmpCmd)
}

exports.spawn = async function spawn(cmd) {
    cmd.message = '#Teleport -116077 -66395 37065; ' + cmd.message.replace('/spawn', '').trim()
    return await this.exec(cmd)
}

exports.exec = async function exec(cmd) {
    aList = await global.admins.list()
    if (!cmd.steamID || !aList[cmd.steamID]) return null

    cmdBuilder.begin()
    let tmpCmd = cmdBuilder.getTmpCmd()
    cmdBuilder.addMessage('global', '#SetFakeName ' + cmd.user)

    let msgCmds = cmd.message.toLowerCase().replace('/exec', '').trim().split(';').map(s => s.trim())
    for (const el of msgCmds) {
        let command = el.split(' ')[0].toLowerCase().trim()
        if (aList[cmd.steamID].canExecute[command] || aList[cmd.steamID].canExecute['#*']) cmdBuilder.addMessage('global', el)
    }

    cmdBuilder.addMessage('global', '#SetFakeName [SF-BOT]')
    cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
    cmdBuilder.addAction('idle')
    return cmdBuilder.fullCommand(tmpCmd)
}

exports.sk_legal = async function sk_legal(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    cmdBuilder.addMessage('global', '[STARTERKIT]: @' + cmd.user + ' you will be teleported to the trading-zone (green circle in B2) to receive your starterkit. Make sure you are ready and not driving a vehicle.')
    cmdBuilder.addMessage('global', '[STARTERKIT]: You will get a quad to get out of the trading-zone again. If you are ready to be teleported type: /ready ')
    return cmdBuilder.fullCommand(cmd)
}

exports.sk_ready = async function sk_ready(cmd, updateFunction) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    cmdBuilder.addMessage('global', '[STARTERKIT]: @' + cmd.user + ' you will be transported to the trading zone in a few seconds.')
    cmdBuilder.addMessage('global', '#Teleport -117129 -66713 37065')
    cmdBuilder.addMessage('global', '#TeleportToMe ' + cmd.steamID)
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
    cmdBuilder.addMessage('global', '#Teleport -116453 -66401 37477')
    cmdBuilder.addMessage('global', '#SpawnVehicle BP_Quad_01_A')
    cmdBuilder.addMessage('local', '[STARTERKIT]: @' + cmd.user + ' your starterkit should now be there any your Quad should be waiting for you outside.')
    cmdBuilder.addMessage('global', '#Teleport -116369 -65906 37144')
    cmdBuilder.addAction('idle')
    return cmdBuilder.fullCommand(cmd)
}

exports.sk_illegal = async function sk_illegal(cmd) {
    if (!cmdBuilder.begin(cmd, 'global')) return null
    cmdBuilder.addMessage('global', '[STARTERKIT]: @' + cmd.user + ' you should have already received your starterkit ;) If not, please contact support.')
    return cmdBuilder.fullCommand(cmd)
}

exports.welcome_new = async function welcome_new(newUser) {
    cmdBuilder.begin()
    let tmpCmd = cmdBuilder.getTmpCmd()
    cmdBuilder.addMessage('global', '[WELCOME]: Welcome to the Server @' + newUser.user + '! If you have any questions, please don\'t hesitate to contact us. You are also entitled to a starterkit! Get it with: /starterkit (in global-chat).')
    return cmdBuilder.fullCommand(tmpCmd)
}

exports.auth_log = async function auth_log(cmd) {
    cmdBuilder.begin()
    cmdBuilder.addMessage('global', '[AUTH]:  >> ' + cmd.user + ' ' + cmd.text + ' << ')
    return cmdBuilder.fullCommand(cmd)
}

exports.kill_feed = async function kill_feed(cmd) {
    cmdBuilder.begin()
    cmdBuilder.addMessage('global', '[KILLFEED]: ' + cmd.killer + ' killed ' + cmd.victim)
    return cmdBuilder.fullCommand(cmd)
}