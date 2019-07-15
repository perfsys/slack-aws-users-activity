'use strict'
const AWS = require('aws-sdk')
const PRESENCE_TABLE = process.env.PRESENCE_TABLE
const documentClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const R = require('ramda')
const moment = require('moment')

module.exports.handler = async function (event, context, callback) {
  // try {
  console.log(`Going to calculate daily statistics from: ${PRESENCE_TABLE}`)

  // Scan params for DDB.
  var params = {
    TableName: PRESENCE_TABLE,
    // Select: 'COUNT',
    // Limit: 10
    //      TODO probaly need to apply scan filter
    // ScanFilter: {
    //   'dateTime': {
    //     ComparisonOperator: 'GT',
    //     AttributeValueList: [
    //       '2019-07-00T00:00:00.000Z'
    //     ]
    //   }
    // }
  }

  const dateTime = R.prop('dateTime')
  const day = R.prop('day')

  // Array to keep all the Items from the DB
  let allData = []

  // Recursive function to get all the data from DDB
  const getAllData = async (params) => {
    console.log('Scanning Table...')
    let data = await documentClient.scan(params).promise()

    if (data['Items'].length > 0) {
      allData = [...allData, ...data['Items']]
    }

    if (data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey
      return await getAllData(params)
    } else {
      return data
    }
  }

  await getAllData(params)
  console.log('Processing Completed')

  // const result = await documentClient.scan(params).promise()
  // const { Items } = result
  // console.log(JSON.stringify(allData))
  console.log(`Items: ${R.length(allData)}`)

  // Will add `day` field to every item in the result array
  const assocDayField = (item) => R.assoc('day', moment(dateTime(item)).format('YYYY-MM-DD'), item)

  // Group all the data by `day` field
  const groupedByDayObj = R.pipe(
    R.map(assocDayField),
    R.groupBy((i) => day(i))
  )(allData)

  // const dayTmp = '2019-07-04'

  // This retuns list of all the days sorter asc
  const days = R.pipe(
    R.keys,
    R.sort(R.comparator(R.gt)),
    R.reverse
  )(groupedByDayObj)

  const excludeDayDateTimeProps = (i) => R.not(R.includes(i, ['day', 'dateTime']))

  // TODO remove it
  // const dayTmpArray = groupedByDayObj[dayTmp]
  // console.log(JSON.stringify(dayTmpArray,null,1))

  // Daily Statistics for a single person
  const personalDailyStatistics = (person, dayValuesArray) => {
    const wasOnline = (run) => R.path([person, 'presenceInt'])(run) > 0
    const wasOffline = (run) => R.path([person, 'presenceInt'])(run) <= 0

    const calculated =
              {
                firstAppear:
                          R.pipe(
                            R.filter(wasOnline),
                            R.map(dateTime),
                            R.sort(R.comparator(R.lt)),
                            R.head
                          )(dayValuesArray),
                lastSeen:
                          R.pipe(
                            R.filter(wasOnline),
                            R.map(dateTime),
                            R.sort(R.comparator(R.lt)),
                            R.last
                          )(dayValuesArray),
                online:
                          R.pipe(
                            R.filter(wasOnline),
                            R.length
                          )(dayValuesArray),
                offline:
                          R.pipe(
                            R.filter(wasOffline),
                            R.length
                          )(dayValuesArray)
              }

    const { firstAppear } = calculated

    const firstAppearMoment = moment(firstAppear)

    // const lastSeenMoment = moment(lastSeen)

    // Adding few for fields f.e.  `firstAppearBefore8am` etc to run analytics
    const firstAppearBefore8am = R.clone(firstAppearMoment)
    // this order is important. First UTC -> startOfDay -> hours
    firstAppearBefore8am
      .utc()
      .startOf('day')
      .hours(8)

    const firstAppearBefore10am = R.clone(firstAppearMoment)
    firstAppearBefore10am
      .utc()
      .startOf('day')
      .hours(10)

    const firstAppearBefore12am = R.clone(firstAppearMoment)
    firstAppearBefore12am
      .utc()
      .startOf('day')
      .hours(12)

    const isBefore = (v) => ((firstAppear) ? firstAppearMoment.isBefore(v) : false) | 0

    return R.pipe(
      R.assoc('firstAppearBefore8am', isBefore(firstAppearBefore8am)),
      R.assoc('firstAppearBefore10am', isBefore(firstAppearBefore10am)),
      R.assoc('firstAppearBefore12am', isBefore(firstAppearBefore12am))
    )(calculated)
  }

  // Running statistics for every user within a day
  const dailyStatistics = (dayValuesArray) => {
    // This produce set of usernames within a day
    const usersInADaySet = R.pipe(
      R.map(R.keys),
      R.reduce(R.union, []),
      R.filter(excludeDayDateTimeProps)

    )(dayValuesArray)

    // Running personal Statistics calculation for every person
    return R.pipe(
      // This "replace" username with statistics object
      R.map((i) => R.assoc(i, personalDailyStatistics(i, dayValuesArray), {})),
      R.mergeAll
    )(usersInADaySet)
  }

  // Final statistics. Replaing day with dailyStastics
  const statisticsAll =
      R.pipe(
        R.map((i) => R.assoc(i, dailyStatistics(R.prop(i, groupedByDayObj)), {})),
        R.mergeAll
      )(days)

  const saveJsonToS3 = async (json)=>{

    const STATISTICS_DAILY_JSON_S3_NAME = process.env.STATISTICS_DAILY_JSON_S3_NAME

    var params = {
      Bucket: STATISTICS_DAILY_JSON_S3_NAME,
      Key: `statistics-daily-${moment().format()}.json`,
      Body: JSON.stringify(
          json
          , null, 1)};
    // var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    await s3.upload(params).promise()

  }

  await saveJsonToS3(statisticsAll)

  console.log(JSON.stringify(
    statisticsAll
    , null, 1))

  // }catch (e) {
  //
  //     console.log(`error: ${e}`)
  // }
}
