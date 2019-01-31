'use strict'
const AWS = require('aws-sdk')
const tools = require('./custom-modules/tools.js')

const Tools = tools()
const DynamoDB = new AWS.DynamoDB.DocumentClient()

module.exports.handler = async function (event, context, callback) {
  try {
    let data = {dateTime: (new Date()).toISOString()}
    let { members } = await Tools.httpsGetRequest('https://slack.com/api/users.list?token=' + process.env.APPLICATION_TOKEN + '&presence=true')

    members.forEach(function (member) {
      if (member.is_bot === false && member.deleted === false && member.name !== 'slackbot') {
        data[member.name] = {
           presenceStr: member.presence,
           presenceInt: member.presence == 'active' ? 1 : 0
        }
      }
    })
    console.log(data)
    let params = {
      TableName: process.env.PRESENCE_TABLE,
      Item: data
    }
    DynamoDB.put(params, function (err, data) {
      if (err !== null) console.log(err)
      console.log("Err: " + JSON.stringify(err))
      console.log("Data: " + JSON.stringify(data))
    })
  } catch (err) {
    console.log(err)
  }
}
