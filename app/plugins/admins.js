const sn = '[ADMINS] -> '
const fetch = require('node-fetch')

exports.list = async function list() {
    let url = process.env.DATA_URL + 'permissions.json'
    return await fetch(url, {
        method: 'Get'
    }).then(res => res.json()).then((json) => {
        return json
    })
}