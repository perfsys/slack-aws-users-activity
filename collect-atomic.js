'use strict'
const AWS = require('aws-sdk')
const {getData} = require('./libs/scraper')
const DynamoDB = new AWS.DynamoDB.DocumentClient()




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
