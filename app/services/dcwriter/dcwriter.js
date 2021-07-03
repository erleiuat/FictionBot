const Discord = require('discord.js')
const format = require('./format')
const sn = global.chalk.cyan('[DCWriter] -> ')
//const gifMaker = require('../../plugins/gifmaker')
const dump = {}
let fakeNameCache = {}
//let gifCreated = []

const channels = {
    kill: process.env.DISCORD_CH_KILL,
    chat: process.env.DISCORD_CH_CHAT,
    login: process.env.DISCORD_CH_LOGIN,
    admin: process.env.DISCORD_CH_ADMIN,
    dump: process.env.DISCORD_CH_CONSOLE,
    maps: process.env.DISCORD_CH_MAPS,
    playerActivity: process.env.DISCORD_CH_PLAYERACTIVITY
}

async function iterate(logFunction, dcClient, seconds = 0.01) {
    do {
        await global.sleep.timer(seconds)
        if (global.updates) continue
        if (global.updatingFTP) continue
        await logFunction(dcClient)
    } while (true)
}

exports.start = async function start(dcClient) {
    await format.loadWeapons()
    iterate(sendKills, dcClient)
    iterate(sendMines, dcClient)
    iterate(sendChats, dcClient)
    iterate(sendAdmins, dcClient)
    iterate(sendLogins, dcClient)
    iterate(sendDump, dcClient)
    iterate(sendMaps, dcClient, 5)
    // iterate(generateGif, dcClient, 60)
}

async function sendMaps(dcClient) {
    if (Object.keys(global.newEntries.maps).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.maps)

    for (const e in global.newEntries.maps) {
        await channel.send(new Discord.MessageEmbed(await format.maps(global.newEntries.maps[e])))
        dump[e] = {
            dump: 'maps',
            ...global.newEntries.maps[e]
        }
        delete global.newEntries.maps[e]
    }
}

async function sendMines(dcClient) {
    if (Object.keys(global.newEntries.mines).length <= 0) return

    for (const e in global.newEntries.mines) {
        if (global.newEntries.mines[e].action == 'armed') global.commands['mine_' + global.newEntries.mines[e].steamID] = {
            time: global.newEntries.mines[e].time,
            message: 'mine_armed'
        }
        dump[e] = {
            dump: 'mines',
            ...global.newEntries.mines[e]
        }
        delete global.newEntries.mines[e]
    }
}

async function sendKills(dcClient) {
    if (Object.keys(global.newEntries.kill).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.kill)

    for (const e in global.newEntries.kill) {
        await channel.send(new Discord.MessageEmbed(await format.kill(global.newEntries.kill[e])))
        if (!global.newEntries.kill[e].Victim.IsInGameEvent) global.commands['kill_' + global.newEntries.kill[e].Victim.UserId] = {
            message: 'kill_feed',
            time: global.newEntries.kill[e].time,
            killer: global.newEntries.kill[e].Killer.ProfileName,
            victim: global.newEntries.kill[e].Victim.ProfileName
        }
        console.log(sn + 'Kill sent: ' + e)
        dump[e] = {
            dump: 'kill',
            ...global.newEntries.kill[e]
        }
        delete global.newEntries.kill[e]
    }

}

async function sendChats(dcClient) {
    if (Object.keys(global.newEntries.chat).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.chat)

    for (const el in global.newEntries.chat) {
        if (global.newEntries.chat[el].type == 'Global') {
            let msg = await format.chat(global.newEntries.chat[el])
            if (msg.fields[0].value.match(/(?:admin|support)/gmi))
                await channel.send(' <@&' + process.env.DISCORD_ROLE_SUPPORT + '> ')
            await channel.send(new Discord.MessageEmbed(msg))
            console.log(sn + 'Chat sent: ' + el)
        }
        if (global.newEntries.chat[el].message.trim().substring(0, 1) == '/') {
            console.log(sn + 'Command detected!')
            global.commands[el] = global.newEntries.chat[el]
        }
        dump[el] = {
            dump: 'chat',
            ...global.newEntries.chat[el]
        }
        delete global.newEntries.chat[el]
    }

}

async function sendAdmins(dcClient) {
    if (Object.keys(global.newEntries.admin).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.admin)

    for (const el in global.newEntries.admin) {
        let line = {
            ...global.newEntries.admin[el]
        }

        let doHide = false
        let doAlert = false
        let msgCmd = line.message.toLowerCase()
        aList = await global.admins.list()

        if (aList[line.steamID].useFakeNames) {
            if (msgCmd.includes('setfakename')) fakeNameCache[line.steamID] = line.message.split(' ')[1]
            else if (msgCmd.includes('clearfakename')) fakeNameCache[line.steamID] = false
        }


        if (aList[line.steamID].hideCommands['#*']) doHide = true
        else
            for (const cmd in aList[line.steamID].hideCommands)
                if (msgCmd.includes(cmd.toLowerCase())) doHide = true


        if (aList[line.steamID].alertCommands['#*']) doAlert = true
        else
            for (const cmd in aList[line.steamID].alertCommands)
                if (msgCmd.includes(cmd.toLowerCase())) doAlert = true


        if (!doHide) {
            let abuserID = false
            if (doAlert) abuserID = aList[line.steamID].discord
            if (fakeNameCache[line.steamID]) line.user = fakeNameCache[line.steamID]
            await channel.send(new Discord.MessageEmbed(await format.admin(line, abuserID)))
            console.log(sn + 'Admin sent: ' + el)
        }

        dump[el] = {
            dump: 'admin',
            ...global.newEntries.admin[el]
        }
        delete global.newEntries.admin[el]
    }

}

async function sendLogins(dcClient) {
    if (Object.keys(global.newEntries.login).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.login)

    for (const el in global.newEntries.login) {

        await channel.send(new Discord.MessageEmbed(await format.login(global.newEntries.login[el])))
        console.log(sn + 'Login sent: ' + el)
        aList = await global.admins.list()

        if (global.newEntries.login[el].type == 'login') global.playersOnline = global.playersOnline + 1
        else global.playersOnline = global.playersOnline - 1

        if (!aList[global.newEntries.login[el].steamID] || !aList[global.newEntries.login[el].steamID].hideLogin) {
            if (global.newEntries.login[el].type == 'login') global.commands['auth_' + global.newEntries.login[el].steamID] = {
                message: 'auth_log',
                time: global.newEntries.login[el].time,
                user: global.newEntries.login[el].user,
                text: 'is joining'
            }
            else if (global.newEntries.login[el].type == 'logout') global.commands['auth_' + global.newEntries.login[el].steamID] = {
                message: 'auth_log',
                time: global.newEntries.login[el].time,
                user: global.newEntries.login[el].user,
                text: 'left'
            }
        }

        dump[el] = {
            dump: 'login',
            ...global.newEntries.login[el]
        }
        delete global.newEntries.login[el]
    }
}

async function sendDump(dcClient) {
    if (Object.keys(dump).length <= 0) return
    let channel = dcClient.channels.cache.find(channel => channel.id === channels.dump)

    for (const el in dump) {
        let msg = false

        if (dump[el].dump == 'kill') msg = {
            ...await format.kill(dump[el], true),
            color: 'ff0000'
        }
        else if (dump[el].dump == 'chat') {
            msg = {
                ...await format.chat(dump[el]),
                color: '0000ff',
                description: dump[el].type.toUpperCase() + '-CHAT'
            }
            if (msg.fields[0].value.match(/(?:admin|support|abuse|abuze)/gmi))
                await channel.send(' <@&' + process.env.DISCORD_ROLE_SUPPORT + '> ')

        } else if (dump[el].dump == 'admin') msg = {
            ...await format.admin(dump[el]),
            color: '00ff00'
        }
        else if (dump[el].dump == 'login') msg = {
            ...await format.login(dump[el]),
            color: '242424'
        }
        else if (dump[el].dump == 'mines') msg = {
            ...await format.mines(dump[el]),
            color: 'F3EA5F'
        }

        if (msg) await channel.send(new Discord.MessageEmbed(msg))
        console.log(sn + 'DUMP sent: ' + el)
        delete dump[el]

    }
}