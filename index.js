'use strict'
const AWS = require('aws-sdk')
const tools = require('./modules/tools.js')

const Tools = tools()
const DynamoDB = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async function (event, context, callback) {
  try {
    let data = []
    let { members } = await Tools.httpsGetRequest('https://slack.com/api/users.list?token=' + process.env.APPLICATION_TOKEN + '&presence=true')

    members.forEach(function (member) {
      if (member.is_bot === false && member.deleted === false && member.name !== 'slackbot') {
        data.push({
          slackName: member.name,
          presenceStr: member.presence,
          presenceInt: member.presence === 'active' ? 1 : 0,
          dateTime: Tools.getDateTime()
        })
      }
    })

    data.forEach(function (item) {
      let params = {
        TableName: process.env.PRESENCE_TABLE,
        Item: item
      }
      DynamoDB.put(params, function (err, data) {
        if (err !== null) console.log(err)
      })
    })
  } catch (err) {
    console.log(err)
  }
}
