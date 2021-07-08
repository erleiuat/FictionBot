const fs = require('fs')
const mapLocation = require('../../plugins/mapLocation/')
const Discord = require('discord.js')

exports.getList = async function getList() {
    let data = JSON.parse(fs.readFileSync('./app/storage/logs/mines.json'))

    let armedTraps = {}
    let triggeredTraps = {}

    for (const e in data) {
        if (data[e].type.includes('Barbed Spike')) continue
        if (data[e].action == 'armed') {
            armedTraps[data[e].location.x.toString().slice(0, 4)] = { x: data[e].location.x, y: data[e].location.y, z: data[e].location.z }
        } else if (data[e].action == 'triggered') {
            triggeredTraps[data[e].location.x.toString().slice(0, 4)] = { x: data[e].location.x, y: data[e].location.y, z: data[e].location.z }
        }
    }

    let activeTraps = []
    let deadTraps = []
    for (const key in armedTraps) {
        if (!triggeredTraps[key]) activeTraps.push([armedTraps[key]['x'], armedTraps[key]['y'], armedTraps[key]['z']])
        else deadTraps.push([armedTraps[key]['x'], armedTraps[key]['y'], armedTraps[key]['z']])
    }

    return {
        active: activeTraps,
        dead: deadTraps
    }
}

exports.buildMap = async function buildMap(list) {
    let filePath = './app/storage/mapLocation/'

    let descr = ''
    for (const trap of list.active) descr += '\n' + trap[0] + ' ' + trap[1] + ' ' + trap[2]
    let fileName1 = 'map_traps_active.jpg'
    await mapLocation.generateMulti(list.active, fileName1, filePath)
    let msg1 = new Discord.MessageEmbed({
        title: 'ACTIVE TRAPS',
        description: descr,
        color: 'F3EA5F',
        files: [new Discord.MessageAttachment(filePath + fileName1, fileName1)],
        image: {
            url: 'attachment://' + fileName1
        }
    })

    let fileName2 = 'map_traps_dead.jpg'
    await mapLocation.generateMulti(list.dead, fileName2, filePath)
    let msg2 = new Discord.MessageEmbed({
        title: 'DEAD TRAPS',
        color: 'F3EA5F',
        type: 'image',
        files: [new Discord.MessageAttachment(filePath + fileName2, fileName2)],
        image: {
            url: 'attachment://' + fileName2
        }
    })

    return [msg2, msg1]
}
