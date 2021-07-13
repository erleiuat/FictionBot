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
    cmdBuilder.addMessage('global', global.bot.shop.trans.form.replace('{user}', cmd.user))
    return cmdBuilder.fullCommand(tmpCmd)
  }

  cmdBuilder.addAction('transfer', {
    from: cmd.steamID,
    to: transferTo,
    amount: amount,
    messages: {
      notEnough: global.bot.shop.trans.notEnough.replace('{user}', cmd.user),
      notFound: global.bot.shop.trans.notFound.replace('{user}', cmd.user),
      success: global.bot.shop.trans.success.replace('{user}', cmd.user),
      started: global.bot.shop.trans.started.replace('{user}', cmd.user),
      somethingWrong: global.bot.shop.trans.somethingWrong.replace('{user}', cmd.user)
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
    cmdBuilder.addMessage('global', global.bot.shop.noItem.replace('{user}', cmd.user))
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
    cmdBuilder.addMessage('global', global.bot.shop.unknownItem.replace('{user}', cmd.user))
    return cmdBuilder.fullCommand(tmpCmd)
  }

  let teleport = global.bot.pos.idle
  let teleportUser = global.bot.pPos.inside.replace('{userID}', cmd.steamID)
  if (item.spawn_location == 'outside') {
    teleport = global.bot.pos.outside
    teleportUser = global.bot.pPos.outside.replace('{userID}', cmd.steamID)
  }

  cmdBuilder.addAction('sale', {
    userID: cmd.steamID,
    userName: cmd.user,
    shop: [-116688, -66384, 1000, 1000],
    item: item,
    teleport: teleport,
    teleportUser: teleportUser,
    messages: {
      notNearShop: global.bot.shop.notNearShop.replace('{user}', cmd.user),
      notEnoughMoney: global.bot.shop.notEnoughMoney.replace('{user}', cmd.user).replace('{fame}', item.price_fame),
      startSale: global.bot.shop.startSale.replace('{user}', cmd.user).replace('{fame}', item.price_fame).replace('{item}', item.name),
      endSale: global.bot.shop.endSale.replace('{user}', cmd.user).replace('{fame}', item.price_fame).replace('{item}', item.name),
      somethingWrong: global.bot.shop.somethingWrong
    }
  })

  cmdBuilder.addMessage('global', global.bot.pos.idle)

  return cmdBuilder.fullCommand(tmpCmd)
}
