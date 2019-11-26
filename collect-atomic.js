'use strict'
const AWS = require('aws-sdk')
const { getUsers, getUsersPresence } = require('./libs/scraper')
const DynamoDB = new AWS.DynamoDB.DocumentClient()

const APPLICATION_TOKEN = process.env.APPLICATION_TOKEN

module.exports.handler = async function (event, context, callback) {
  // try {

  const users = await getUsers(APPLICATION_TOKEN)
  let dataToDB = await getUsersPresence(APPLICATION_TOKEN, users)

  dataToDB.dateTime = (new Date()).toISOString()

  let response = await DynamoDB.put({ TableName: process.env.PRESENCE_TABLE, Item: dataToDB }).promise()
  console.log('Results were successfully saved.\n' + JSON.stringify(response))
  return dataToDB
  // } catch (err) {
  //   console.log('An error occurred while recording presence cut:\n' + JSON.stringify(err))
  //   return new Error('Collect atomic failed')
  // }
}
