'use strict'
const AWS = require('aws-sdk')
const utils = require('./libs/utils.js')

const Utils = utils()
const DynamoDB = new AWS.DynamoDB.DocumentClient()
const getData = async function (url, params = null) {
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
      resolve(dataToDB)
    } catch (err) {
      reject(err)
    }
  })
}
const dynamoPut = function (params) {
  return new Promise(function (resolve, rejects) {
    DynamoDB.put(params, function (err, data) {
      if (err !== null) reject(err)
      else resolve(data)
    })
  })
}

module.exports.handler = async function (event, context, callback) {
  try {
    let dataToDB = await getData('https://slack.com/api/users.list?token=' + process.env.APPLICATION_TOKEN + '&presence=true')
    dataToDB.dateTime = (new Date()).toISOString()
    let response = await dynamoPut({ TableName: process.env.PRESENCE_TABLE, Item: dataToDB })
    console.log('Presence cut was successfully recorded.\n' + JSON.stringify(response))
  } catch (err) {
    console.log('An error occured while recording presence cut:\n' + JSON.stringify(err))
  }
}
