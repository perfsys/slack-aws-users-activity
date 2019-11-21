const {expect} = require('chai')


describe('scraper tests',()=>{

    it('getDataTest', async function() {

        const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN
        const {getData} = require('../libs/scraper')
        const data = await getData(`https://slack.com/api/users.list?token=${APPLICATION_TOKEN}&presence=true`)

        expect(data).to.be.a('object');

    });



})
