const R = require('ramda')
const axios = require('axios')

const getUsers = async function (APPLICATION_TOKEN, params = null) {
  const url = 'https://slack.com/api/users.list'
  console.log(`[getData] url: ${url}`)

  const { data } = await axios.get(url, {
    params: {
      token: APPLICATION_TOKEN
    }
  })

  const members = R.prop('members', data)

  const isNotBot = R.filter(i => i.is_bot === false)
  const isActive = R.filter(i => i.deleted === false)
  const isNotSlackBot = R.filter(i => i.name !== 'slackbot')

  const mapPresence = R.map(i => {
    return {
      id: i.id,
      name: i.name
    }
  })

  const dataToDB = R.pipe(isActive, isNotBot, isNotSlackBot,
    // map to only fields we look for
    mapPresence
  )(members)

  // TODO I am not sure why this is required. Probably this is about paging
  // if (typeof (response_metadata.next_cursor) === 'string' && response_metadata.next_cursor.length > 0) {
  //   setTimeout(async function () {
  //     Object.assign(dataToDB, await getUsers(response_metadata.next_cursor, params))
  //   }, params.requestTimeout >= params.timeoutLimit ? params.requestTimeout : params.requestTimeout += params.timeoutStep)
  // }

  console.log(`[getData] dataToDB: ${JSON.stringify(dataToDB)}`)
  // resolve(dataToDB)

  return dataToDB
}

const getUsersPresence = async function (APPLICATION_TOKEN, users) {
  const url = 'https://slack.com/api/users.getPresence'

  const allPromises =
  R.pipe(
    // User IDs only
    // R.map((i)=>R.prop('id',i)),
    // To axios request
    R.map((i) => axios.get(url, {
      params: {
        token: APPLICATION_TOKEN,
        // this is a lifehack. We send params like `user` and `name` to read back from request object
        user: R.prop('id', i),
        name: R.prop('name', i)
      }
    }))
  )(users)

  const allResponse = await Promise.all(allPromises)

  // https://github.com/ramda/ramda/wiki/Cookbook#make-an-object-out-of-keys-with-values-derived-from-them
  const objFromListWith = R.curry((fn, list) => R.chain(R.zipObj, R.map(fn))(list))

  return R.pipe(
    // R.map(i=>R.prop('data',i))
    R.map(i => {
      return {
        user: R.path(['config', 'params', 'user'], i),
        name: R.path(['config', 'params', 'name'], i),
        presence: R.path(['data', 'presence'], i)
      }
    }),
    // Add presenceInt
    R.map(i => R.assoc('presenceInt', i.presence === 'active' ? 1 : 0, i)),
    // Converting array to object
    objFromListWith(R.prop('name'))
  )(allResponse)
}

exports.getUsers = getUsers
exports.getUsersPresence = getUsersPresence
