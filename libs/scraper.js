const utils = require('./utils.js')
const R = require('ramda')

const Utils = utils()

const getData = async function (url, params = null) {
    console.log(`[getData] url: ${url}`)
    if (params === null) params = { requestTimeout: 0, timeoutStep: 500, timeoutLimit: 3000 }
    return new Promise(async function (resolve, reject) {
        try {
            let { members, response_metadata } = await Utils.httpsGetRequest(url)

            const isNotBot = R.filter(i=>i.is_bot === false)
            const isActive = R.filter(i=>i.deleted === false)
            const isNotSlackBot = R.filter(i=>i.name !== 'slackbot')

            const mapPresence = R.map(i=>{
                return {
                    name: i.name,
                    presenceStr: i.presence,
                    presenceInt: i.presence === 'active' ? 1 : 0
                }
            })

            // Make an object out of a list
            // https://github.com/ramda/ramda/wiki/Cookbook#make-an-object-out-of-keys-with-values-derived-from-them
            const objFromListWith = R.curry((fn, list) => R.chain(R.zipObj, R.map(fn))(list))

            const dataToDB = R.pipe(isActive, isNotBot, isNotSlackBot,
                // map to only fields we look for
                mapPresence,
                // field to be used as a key of object
                objFromListWith(R.prop('name'))
            )(members)

            // members.forEach(function (member) {
            //   if (member.is_bot === false && member.deleted === false && member.name !== 'slackbot') {
            //     dataToDB[member.name] = {
            //       presenceStr: member.presence,
            //       presenceInt: member.presence === 'active' ? 1 : 0
            //     }
            //   }
            // })

            if (typeof (response_metadata.next_cursor) === 'string' && response_metadata.next_cursor.length > 0) {
                setTimeout(async function () {
                    Object.assign(dataToDB, await getData(response_metadata.next_cursor, params))
                }, params.requestTimeout >= params.timeoutLimit ? params.requestTimeout : params.requestTimeout += params.timeoutStep)
            }

            console.log(`[getData] dataToDB: ${JSON.stringify(dataToDB)}`)
            resolve(dataToDB)
        } catch (err) {
            reject(err)
        }
    })
}

exports.getData = getData;
