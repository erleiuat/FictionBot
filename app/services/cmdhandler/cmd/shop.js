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
        ' Famepoints starts now.',
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

  return cmdBuilder.fullCommand(tmpCmd)
}
