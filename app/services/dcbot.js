const sn = '[DISCORD-BOT] -> '
const fetch = require('node-fetch')
const dadJokes = false

global.doSend = true

async function doFetch(url) {
  return await fetch(url, {
    method: 'Get'
  })
    .then(res => res.text())
    .then(body => {
      return body
    })
}

async function processContent(data, dcClient) {
  let channel = dcClient.channels.cache.find(channel => channel.id === data.id)
  await clearChannel(channel)

  for (const e in data.content) {
    let part = data.content[e]
    if (part['type'] == 'image') {
      if (global.doSend)
        await channel.send({
          files: [part['data']]
        })
    } else if (part['type'] == 'text') {
      let text = await doFetch(part['data'])
      if (text.includes('{{SPLIT}}')) textChunks = text.split('{{SPLIT}}')
      else textChunks = [text]
      for (const chunk in textChunks) {
        if (textChunks[chunk] && textChunks[chunk].length >= 1)
          if (global.doSend) channel.send(textChunks[chunk])
      }
    }
  }
}

async function buildServer(dcClient, msg) {
  if (msg && !msg.member.hasPermission('ADMINISTRATOR')) return
  let data = await fetch(process.env.DATA_URL + 'bot_data/dc_text/data.json', {
    method: 'Get'
  })
    .then(res => res.json())
    .then(json => {
      return json
    })
  for (const i in data) await processContent(data[i], dcClient)
}

async function clearChannel(channel) {
  var msg_size = 100
  while (msg_size == 100)
    await channel
      .bulkDelete(100, true)
      .then(messages => (msg_size = messages.size))
      .catch(console.error)
}

async function clearchat(msg) {
  if (msg.member.hasPermission('ADMINISTRATOR')) {
    global.log.debug(sn + '"!clearchat" detected! Clearing channel...')
    await clearChannel(msg.channel)
    global.log.debug(sn + 'Channel cleaned.')
  }
}

async function setLang(msg) {
  let rNew = msg.channel.guild.roles.cache.find(
    role => role.id === process.env.DISCORD_ROLE_NEWCOMER
  )
  let rEnglish = msg.channel.guild.roles.cache.find(
    role => role.id === process.env.DISCORD_ROLE_LANG_ENG
  )
  let rGerman = msg.channel.guild.roles.cache.find(
    role => role.id === process.env.DISCORD_ROLE_LANG_GER
  )
  let rPlayer = msg.channel.guild.roles.cache.find(
    role => role.id === process.env.DISCORD_ROLE_PLAYER
  )

  if (msg.content.toLowerCase().trim().includes('english')) {
    msg.member.roles.remove(rNew)
    msg.member.roles.remove(rGerman)
    msg.member.roles.add(rPlayer)
    msg.member.roles.add(rEnglish)
  } else if (
    msg.content.toLowerCase().trim().includes('german') ||
    msg.content.toLowerCase().trim().includes('deutsch')
  ) {
    msg.member.roles.remove(rNew)
    msg.member.roles.remove(rEnglish)
    msg.member.roles.add(rPlayer)
    msg.member.roles.add(rGerman)
  } else {
    global.log.debug(msg)
  }

  await msg.delete()
}

function imBot(channel, msg) {
  if (global.doSend) channel.send('Hello ' + msg + ", I'm FictionBot")
}

exports.start = async function start(dcClient) {
  dcClient.on('message', async msg => {
    if (msg.content.toLowerCase().startsWith('!clearchat')) clearchat(msg)
    else if (msg.content.toLowerCase().startsWith('!buildserver')) buildServer(dcClient, msg)
    else if (msg.channel.id == process.env.DISCORD_CH_LANGUAGE) setLang(msg)
    else if (msg.author.id !== process.env.DISCORD_BOT_ID) {
      console.log(msg.content)
    }
  })

  dcClient.on('guildMemberAdd', guildMember => {
    guildMember.roles.add(
      guildMember.guild.roles.cache.find(role => role.id == process.env.DISCORD_ROLE_NEWCOMER)
    )
  })

  buildServer(dcClient, false)
}
