const sn = '[DCWriter] -> [Format] -> '
const fetch = require('node-fetch')
const Discord = require('discord.js')
const fs = require('fs')
let weaponImg = null

function formCoords(valArr) {
  cStr = ''
  for (el in valArr) {
    valArr[el] = valArr[el].toString()
    if (valArr[el].includes('.'))
      valArr[el] = valArr[el].substring(0, valArr[el].indexOf('.') + 4)
    cStr += ' ' + valArr[el]
  }
  return cStr
}

function hasImg(weapon) {
  if (!weapon) return false
  if (weapon.includes('_C')) weapon = weapon.split('_C')[0].replace(/\s/g, '')
  if (weaponImg[weapon])
    return process.env.DATA_URL + 'bot_data/weapon/' + weaponImg[weapon]
}

function formDate(dateStr) {
  let dParts = dateStr.date.split('.')
  return new Date(
    dParts[2] + '-' + dParts[1] + '-' + dParts[0] + 'T' + dateStr.time
  )
}

async function findMineOwner(steamID, date, time) {
  let data = JSON.parse(fs.readFileSync('./app/storage/logs/mines.json'))
  let trigger = formDate({
    date: date,
    time: time
  })
  let from = new Date(trigger.getTime() - 1 * 60000).getTime()
  let to = new Date(trigger.getTime() + 1 * 60000).getTime()
  for (const e in data) {
    if (data[e].action == 'triggered' && data[e].steamID == steamID) {
      let check = formDate({
        date: data[e].time.date,
        time: data[e].time.time
      }).getTime()
      if (check > from && check < to) return data[e].owner
    }
  }
  return false
}

exports.loadWeapons = async function loadWeapons() {
  let url = process.env.DATA_URL + 'bot_data/weapon/_weaponlist.json'
  await fetch(url, {
    method: 'Get'
  })
    .then(res => res.json())
    .then(json => {
      weaponImg = json
    })
}

exports.maps = async function maps(entry) {
  let attachment = new Discord.MessageAttachment(entry.fullPath, entry.fileName)
  let msg = {
    color: '73A832',
    type: 'image',
    files: [attachment],
    image: {
      url: 'attachment://' + entry.fileName
    },
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }

  return msg
}

exports.mines = async function mines(entry) {
  let attachment = new Discord.MessageAttachment(
    entry.file.path + entry.file.name,
    entry.file.name
  )
  let msg = {
    title: 'MINE-ACTION -> ' + entry.action,
    color: 'F3EA5F',
    files: [attachment],
    image: {
      url: 'attachment://' + entry.file.name
    },
    fields: [
      {
        name: 'From',
        value: entry.user,
        inline: true
      },
      {
        name: 'SteamID',
        value: entry.steamID,
        inline: true
      },
      {
        name: 'Location',
        value: formCoords(entry.location),
        inline: false
      },
      {
        name: 'Action',
        value: entry.action,
        inline: true
      },
      {
        name: 'Type',
        value: entry.type,
        inline: true
      }
    ],
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }

  if (entry.action == 'triggered') {
    msg.fields.push({
      name: 'Owner',
      value: entry.owner.user + '(' + entry.owner.steamID + ')'
    })
  }
  return msg
}

exports.kill = async function kill(entry, dump = false) {
  if (entry.Killer.ProfileName.toLowerCase() == 'unknown') {
    let mineOwner = await findMineOwner(
      entry.Victim.UserId,
      entry.time.date,
      entry.time.time
    )
    if (mineOwner) {
      entry.Killer.ProfileName = mineOwner.user
      entry.Killer.UserId = mineOwner.steamID
    }
  }

  let msg = {
    color: 'ff0000',
    fields: [
      {
        name: 'Killer',
        value: entry.Killer.ProfileName,
        inline: true
      },
      {
        name: 'Victim',
        value: entry.Victim.ProfileName,
        inline: true
      },
      {
        name: 'Weapon',
        value: entry.Weapon
      }
    ],
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }

  let img = hasImg(entry.Weapon)
  if (img)
    msg.thumbnail = {
      url: img
    }

  if (entry.distance > 0)
    msg.fields.push({
      name: 'Distance',
      value: entry.distance + ' Meters'
    })

  if (entry.Victim.IsInGameEvent) {
    msg.title = 'Event-Kill'
    msg.color = '00ffff'
  }

  if (dump) {
    let attachment = new Discord.MessageAttachment(
      entry.file.path + entry.file.name,
      entry.file.name
    )
    msg.files = [attachment]
    msg.image = {
      url: 'attachment://' + entry.file.name
    }
    msg.fields.push({
      name: 'Killer Position',
      value: formCoords(entry.Killer.ServerLocation)
    })
    msg.fields.push({
      name: 'Victim Position',
      value: formCoords(entry.Victim.ServerLocation)
    })
  }

  return msg
}

exports.chat = async function chat(entry) {
  let color = 'ffffff'
  let uName = entry.user
  if (entry.message.trim().startsWith('/')) color = 'FFCC00'
  else if (uName.startsWith('・ :[FiBo]')) {
    color = '00FFFF'
    uName = '[FiBo] (FictionBot)'
  } else if (uName.startsWith('[DC]')) {
    color = '7289DA'
    uName = uName.replace('[DC]', '[Discord]')
  }
  return {
    color: color,
    fields: [
      {
        name: uName,
        value: entry.message
      }
    ],
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }
}

exports.admin = async function admin(entry, abuserID = false) {
  let msg = {
    color: '34a853',
    fields: [
      {
        name: entry.user,
        value: entry.message
      }
    ],
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }
  if (abuserID) {
    msg.color = 'dc122a'
    msg.description =
      '<@' +
      abuserID +
      '>\n**__Please explain by replying to the message what you needed the command for__**\n'
    msg.fields[0].name = '\u200b'
    msg.fields[0].value = '**' + msg.fields[0].value + '**'
    msg.fields.push({
      name: '\u200b',
      value:
        '_@here if you don\'t want to receive admin abuse notifications in the future, change the notification settings of this channel to "nothing"_'
    })
  }
  return msg
}

exports.login = async function login(entry) {
  let msg = {
    fields: [
      {
        name: 'ID',
        value: entry.userID,
        inline: true
      },
      {
        name: 'IP',
        value: entry.ip,
        inline: true
      },
      {
        name: 'SteamID',
        value: entry.steamID,
        inline: true
      }
    ],
    footer: {
      text: entry.time.date + ` - ` + entry.time.time
    }
  }

  if (entry.type == 'logout')
    return {
      color: 'FF0000',
      title: 'Logout -> ' + entry.user,
      ...msg
    }

  if (entry.drone)
    return {
      color: 'FFFF00',
      title: 'Login -> ' + entry.user + ' (as drone)',
      ...msg
    }

  return {
    color: 'FFFF00',
    title: 'Login -> ' + entry.user,
    ...msg
  }
}
