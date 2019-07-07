'use strict'
const AWS = require('aws-sdk')
const utils = require('./libs/utils.js')

const Utils = utils()
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const getData = async function (url, params = null) {
  console.log(`[getData] url: ${url}`)
  if (params === null) params = { requestTimeout: 0, timeoutStep: 500, timeoutLimit: 3000 }
  return new Promise(async function (resolve, reject) {
    try {
      let dataToDB = {}
      let { members, response_metadata } = await Utils.httpsGetRequest(url)
      members.forEach(function (member) {
        if (member.is_bot === false && member.deleted === false && member.name !== 'slackbot') {
          dataToDB[member.name] = {
            presenceStr: member.presence,
            presenceInt: member.presence === 'active' ? 1 : 0
          }
        }
      })
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



module.exports.handler = async function (event, context, callback) {
  // try {
    let dataToDB = await getData('https://slack.com/api/users.list?token=' + process.env.APPLICATION_TOKEN + '&presence=true')
    dataToDB.dateTime = (new Date()).toISOString()

    let response = await DynamoDB.put({ TableName: process.env.PRESENCE_TABLE, Item: dataToDB }).promise()
    console.log('Results were successfully saved.\n' + JSON.stringify(response))
    return dataToDB;
  // } catch (err) {
  //   console.log('An error occurred while recording presence cut:\n' + JSON.stringify(err))
  //   return new Error('Collect atomic failed')
  // }
}
