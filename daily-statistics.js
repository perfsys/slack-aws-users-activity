'use strict'
const AWS = require('aws-sdk')
const PRESENCE_TABLE = process.env.PRESENCE_TABLE
const documentClient = new AWS.DynamoDB.DocumentClient();
const R = require('ramda');




module.exports.handler = async function (event, context, callback) {
    // try {
        console.log(`Going to calculate daily statistics from: ${PRESENCE_TABLE}`)

        var params = {
            TableName : PRESENCE_TABLE,
            // Limit: 10
            // FilterExpression : 'Year = :this_year',
            // ExpressionAttributeValues : {':this_year' : 2015}
        };

        const {Items} = await documentClient.scan(params).promise();

        const sortByDatetime = R.sortBy(R.prop('dateTime'))
        console.log(JSON.stringify(R.pipe(sortByDatetime,R.reverse, R.head)(Items),null,1))




    // }catch (e) {
    //
    //     console.log(`error: ${e}`)
    // }


}
