const sn = global.chalk.bgMagenta('[GAMEBOT] -> ')
//const sn = '[GAMEBOT] -> '
const cp = require('child_process')

let bot = false

exports.execute = async function execute(cmd) {
    if (!cmd || !cmd.commands || !cmd.commands.length) return

    let resp = {
        error: false
    }

    for (const command of cmd.commands) {
        for (const cmdType in command) {

            if (cmdType == 'messages') resp = {
                ...resp,
                ...await this.messages(command[cmdType])
            }
            else if (cmdType == 'actions') resp = {
                ...resp,
                ...await this.actions(command[cmdType])
            }
            else continue

            if (resp.error) {
                if (resp.errorMessage) console.log(sn + 'Error: ' + resp.errorMessage)
                else console.log(sn + 'Error while executing (no message)')
            }

        }
    }

    return resp
}


async function resOutput(resolve, logTxt) {
    bot.stdout.once('data', data => {
        data = `${data}`
        console.log(sn + data)
        console.log(sn + logTxt)
        try {
            resolve(JSON.parse(data))
        } catch (err) {
            console.log(err)
            resolve(false)
        }
    })
}


exports.start = async function start() {
    return new Promise(resolve => {
        bot = cp.spawn('py', ['./app/gamebot/scripts/gamebot.py'])
        console.log(sn + 'Starting Bot')
        resOutput(resolve, 'Bot running')
        bot.stdin.setEncoding('utf-8')
        bot.stderr.on('data', (data) => {
            console.log(sn + 'Error: ' + `${data}`)
        })
    })
}


exports.messages = async function messages(msgs) {
    return new Promise(resolve => {
        console.log(sn + 'Sending messages')
        resOutput(resolve, 'Messages sent')
        bot.stdin.write('MESSAGES\n')
        bot.stdin.write(JSON.stringify(msgs) + '\n')
    })
}


exports.actions = async function actions(action) {
    return new Promise(resolve => {
        console.log(sn + 'Doing actions')
        resOutput(resolve, 'Actions done')
        bot.stdin.write('ACTION\n')
        bot.stdin.write(JSON.stringify(action) + '\n')
    })
}