const sn = '[STATISTICS] -> '
const Discord = require('discord.js')
const statList = require('./statlist')
const playerstats = require('./playerstats')
const newPlayers = require('./newplayers')
const genMaps = require('./genMaps')

const cache = {
    rankingMsgs: [],
    rankingPlaytime: {},
    rankingKills: {},
    admPlayerstats: {},
    trapList: {},
    list3: {},
    list4: {}
}

function formMsgs(listArr) {
    let msgs = []
    let tmpMsg = ''
    for (let i = 0; i < listArr.length; i++) {
        tmpMsg += listArr[i]
        if (tmpMsg.length >= 1800) {
            msgs.push(tmpMsg)
            tmpMsg = ''
        }
    }
    msgs.push(tmpMsg)
    return msgs
}

async function iterateLists(dcClient) {
    let iteration = 1
    let chRanking = dcClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CH_RANKING)
    let chStats = dcClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CH_PLAYERSTATS)

    do {
        await global.sleep.timer(5)
        if (global.updates) continue
        if (global.updatingFTP) continue

        var d = new Date()
        d.setDate(d.getDate() - 7)
        let logins = await statList.getLogin(d.getTime())
        let logins2 = await statList.getLogin()
        let kills = await statList.getKill()

        let rankingMsgs = []
        if (logins) {
            let rankingPlaytime = await playerstats.rankingPlaytime(logins)
            if (JSON.stringify(rankingPlaytime) != JSON.stringify(cache.rankingPlaytime)) {
                rankingMsgs = rankingMsgs.concat(rankingPlaytime)
                global.log.debug(sn + 'Updated playtime ranking')
                cache.rankingPlaytime = rankingPlaytime
            } else {
                rankingMsgs = rankingMsgs.concat(cache.rankingPlaytime)
            }
        }

        if (Object.keys(kills).length > 0) {
            let rankingKills = await playerstats.rankingKills(kills)
            if (JSON.stringify(rankingKills) != JSON.stringify(cache.rankingKills)) {
                rankingMsgs = rankingMsgs.concat(rankingKills)
                global.log.debug(sn + 'Updated kills ranking')
                cache.rankingKills = rankingKills
            } else {
                rankingMsgs = rankingMsgs.concat(cache.rankingKills)
            }
        }

        if (JSON.stringify(rankingMsgs) != JSON.stringify(cache.rankingMsgs)) {
            await dcSend(rankingMsgs, chRanking)
            cache.rankingMsgs = rankingMsgs
        }

        if (logins2) {
            let admPlayerstats = await playerstats.list(logins2)
            if (JSON.stringify(admPlayerstats) != JSON.stringify(cache.admPlayerstats)) {
                let msgs = formMsgs(admPlayerstats)
                msgs.push('\n-----\n\n**TOTAL: ' + admPlayerstats.length + '**')
                await dcSend(msgs, chStats)
                global.log.debug(sn + 'Updated player-stats')
                cache.admPlayerstats = admPlayerstats
            }
        }

        iteration++
    } while (true)
}

async function iterateOnline(dcClient) {
    let chOnline = dcClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CH_PLAYERONLINE)

    do {
        await global.sleep.timer(1)
        if (global.updates) continue
        if (global.updatingFTP) continue
        let list = await playerstats.online(await statList.getLogin())
        list.push('\n-----\n\n**Currently: ' + list.length + '**\n\n**Highscore: ' + (await statList.highscore(list.length)) + '**\n')
        if (JSON.stringify(list) != JSON.stringify(cache.list3)) {
            await dcSend(formMsgs(list), chOnline)
            global.log.debug(sn + 'Updated players-online')
            cache.list3 = list
        }
    } while (true)
}

async function iterateNewPlayers(dcClient) {
    let chNew = dcClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CH_NEWPLAYERS)

    do {
        await global.sleep.timer(10)
        if (global.updates) continue
        if (global.updatingFTP) continue
        let list = await newPlayers.get()
        if (JSON.stringify(list) != JSON.stringify(cache.list4)) {
            await dcSend(list, chNew)
            global.log.debug(sn + 'Updated new-players')
            cache.list4 = list
        }
    } while (true)
}

async function mapTraps(dcClient) {
    let chTraps = dcClient.channels.cache.find(channel => channel.id === process.env.DISCORD_CH_MINES)

    do {
        await global.sleep.timer(10)
        if (global.updates) continue
        if (global.updatingFTP) continue
        let trapList = await genMaps.getList()
        if (trapList.active.length && JSON.stringify(trapList) != JSON.stringify(cache.trapList)) {
            await dcSend(await genMaps.buildMap(trapList), chTraps)
            global.log.debug(sn + 'Updated Trap-Map')
            cache.trapList = trapList
        }
    } while (true)
}

exports.start = async function start(dcClient) {
    iterateLists(dcClient)
    iterateOnline(dcClient)
    iterateNewPlayers(dcClient)
    mapTraps(dcClient)
}

async function dcSend(msgs, channel) {
    await clearChannel(channel)
    for (const msg of msgs) {
        if (msg.length > 0) await channel.send(msg)
    }
}

async function clearChannel(channel) {
    var msg_size = 100
    while (msg_size == 100)
        await channel
            .bulkDelete(100, true)
            .then(messages => (msg_size = messages.size))
            .catch(console.error)
}
