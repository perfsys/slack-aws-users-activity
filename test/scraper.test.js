const { expect } = require('chai')

describe('scraper tests', function () {
  it('getDataTest', async function () {
    // TODO need to export ENV
    // export APPLICATION_TOKEN=xoxp-XXXXXXX
    const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN
    const { getData } = require('../libs/scraper')
    const data = await getData(`https://slack.com/api/users.list?token=${APPLICATION_TOKEN}&presence=true`)

    expect(data).to.be.a('object')
  })
})
