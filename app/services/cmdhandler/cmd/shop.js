const cmdBuilder = require('../cmdbuilder')
const fetch = require('node-fetch')

async function getItemList() {
  let url = process.env.DATA_URL + 'shop_data/items.json'
  return await fetch(url, {
    method: 'Get'
  })
    .then(res => res.json())
    .then(json => {
      return json
    })
}

exports.transfer = async function transfer(cmd) {
  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()
  let parts = cmd.message.split(' ')
  let amount = parts[1].replace('[', '').replace(']', '')
  let transferTo = parts[2].replace('[', '').replace(']', '')

  if (!transferTo) {
    cmdBuilder.addMessage(
      'global',
      ':[Transfer]: ・ @' +
        cmd.user +
        ' Use this format: /transfer [amount] [user]'
    )
    return cmdBuilder.fullCommand(tmpCmd)
  }

  cmdBuilder.addAction('transfer', {
    from: cmd.steamID,
    to: transferTo,
    amount: amount,
    messages: {
      notEnough:
        ':[Transfer]: ・ @' +
        cmd.user +
        " You don't have enough famepoints for this transaction.",
      notFound:
        ':[Transfer]: ・ @' +
        cmd.user +
        " I couldn't find the recipient with that name. Make sure to tell the name as it is spelled in chat.",
      success:
        ':[Transfer]: ・ @' + cmd.user + ' Your transaction was successful.',
      started:
        ':[Transfer]: ・ @' + cmd.user + ' Transaction started. Please wait...',
      somethingWrong:
        ':[Transfer]: ・ @' +
        cmd.user +
        ' Something went wrong. Please try again.'
    }
  })

  return cmdBuilder.fullCommand(tmpCmd)
}

exports.shop_item = async function shop_item(cmd) {
  cmdBuilder.begin()
  let tmpCmd = cmdBuilder.getTmpCmd()

  let items = await getItemList()
  let itemKey = cmd.message.split(' ')[1]

  if (!itemKey || !itemKey.trim()) {
    cmdBuilder.addMessage(
      'global',
      ':[Shop]: ・ @' +
        cmd.user +
        ' you need to tell me what Item you want to buy.'
    )
    return cmdBuilder.fullCommand(tmpCmd)
  }

  let item = false
  itemKey = itemKey.trim().toLowerCase()
  for (const el of items)
    if (itemKey == el.keyword.toLowerCase()) {
      item = el
      break
    }

  if (!item || !item.spawn_command) {
    cmdBuilder.addMessage(
      'global',
      ':[Shop]: ・ @' + cmd.user + " I don't know this item."
    )
    return cmdBuilder.fullCommand(tmpCmd)
  }

  let teleport = '#Teleport -117122 -66734 37070'
  if (item.spawn_location == 'outside')
    teleport = '#Teleport -116077 -66395 37065'

  cmdBuilder.addAction('sale', {
    userID: cmd.steamID,
    userName: cmd.user,
    shop: [-116688, -66384, 1000, 1000],
    item: item,
    teleport: teleport,
    messages: {
      notNearShop:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you need to be near the shop to buy things.',
      notEnoughMoney:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you need at least ' +
        item.price_fame +
        ' Famepoints to buy this.',
      startSale:
        ':[Shop]: ・ @' +
        cmd.user +
        ' your purchase of ' +
        item.name +
        ' for ' +
        item.price_fame +
        ' Famepoints starts now.',
      endSale:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you successfully bought ' +
        item.name +
        ' for ' +
        item.price_fame +
        ' Famepoints!'
    },
    messages: {
      notNearShop:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you need to be near the shop to buy things.',
      notEnoughMoney:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you need at least ' +
        item.price_fame +
        ' Famepoints to buy this.',
      startSale:
        ':[Shop]: ・ @' +
        cmd.user +
        ' your purchase of ' +
        item.name +
        ' for ' +
        item.price_fame +
        " Famepoints starts shortly. You will be teleported to your Item when it's done.",
      endSale:
        ':[Shop]: ・ @' +
        cmd.user +
        ' you successfully bought ' +
        item.name +
        ' for ' +
        item.price_fame +
        ' Famepoints!',
      somethingWrong: ':[Shop]: ・ Something went wrong. Please try again.'
    }
  })

  cmdBuilder.addMessage('global', '#Teleport -117122 -66734 37070')

  return cmdBuilder.fullCommand(tmpCmd)
}
