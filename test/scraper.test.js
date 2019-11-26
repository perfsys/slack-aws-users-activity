const { expect } = require('chai')
const usersTestData = require('./data/test-data-users')

describe('scraper tests', function () {
  it('getUsersTest', async function () {
    // TODO need to export ENV
    // export APPLICATION_TOKEN=xoxp-XXXXXXX
    const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN
    const { getUsers } = require('../libs/scraper')
    const data = await getUsers(APPLICATION_TOKEN)

    expect(data).to.be.a('array')
  })

  it('getUsersPresence', async function () {
    const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN
    const { getUsersPresence } = require('../libs/scraper')
    const data = await getUsersPresence(APPLICATION_TOKEN, usersTestData)

    expect(data).to.be.a('object')
  })
})
