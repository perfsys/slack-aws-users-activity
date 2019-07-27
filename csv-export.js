'use strict'
const AWS = require('aws-sdk')
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const R = require('ramda')
const moment = require('moment')
const stringify = require('csv-stringify')
const sortObj = require('sort-object');

module.exports.handler = async function (event, context, callback) {
    const filename= 'statistics-daily-v2-2019-07-27T11:53:56+00:00.json'
    // console.log(`Going to calculate daily statistics from: ${PRESENCE_TABLE}`)


    const readJSONfrommS3 = async (file)=>{
        const STATISTICS_DAILY_JSON_S3_NAME = process.env.STATISTICS_DAILY_JSON_S3_NAME
        console.log(`Reading S3 file '${file}' from '${STATISTICS_DAILY_JSON_S3_NAME}' ...`)

        const params = {
            Bucket: STATISTICS_DAILY_JSON_S3_NAME,
            Key: file
        };

        const {Body, ContentLength, LastModified} = await s3.getObject(params).promise()

        console.log(`File from S3: ${ContentLength} ${LastModified}`)

        return JSON.parse(Body.toString())
    }

    const getDayValues = (day)=>R.pipe(R.prop(day), R.assoc('day',day))(jsonData)

    const jsonData = await readJSONfrommS3(filename)

    const flattenLevel1Array = R.pipe(R.keys,R.map(getDayValues))(jsonData)

    // const tmpObj = flatternLevel1Array[0]

    const notDayPredicate = (i)=>'day'!==i

    const getUserValues = (obj)=>{
        const day = R.prop('day')(obj)
        const keys = R.keys(obj).filter(notDayPredicate)

        const getValues = (user)=>R.pipe(R.prop(user), R.assoc('day',day), R.assoc('user',user))(obj)

        return R.map(getValues)(keys)

    }

    const keysMap = {
        day: '_01_day',
        weekDay: '_02_weekDay',
        user: '_03_user',
        firstAppear: '_04_firstAppear',
        lastSeen: '_05_lastSeen',
        //
        online: '_10_online',
        offline: '_11_offline',
        percentageOnline: '_12_offline',
        //
        firstAppearBefore8am: '_20_firstAppearBefore8am',
        firstAppearBefore10am: '_21_firstAppearBefore10am',
        firstAppearBefore12am: '_22_firstAppearBefore12am',
        firstAppearAfter14am: '_23_firstAppearAfter14am',
        firstAppearAfter16am: '_24_firstAppearAfter16am'
    };

    // TODO not my method from
    // https://medium.com/free-code-camp/30-seconds-of-code-rename-many-object-keys-in-javascript-268f279c7bfa
    const renameKeys = (obj) => Object
        .keys(obj)
        .reduce((acc, key) => ({
            ...acc,
            ...{ [keysMap[key] || key]: obj[key] }
        }), {});


    const saveCsvStream = async (stream) => {
        const STATISTICS_DAILY_CSV_S3_NAME = process.env.STATISTICS_DAILY_CSV_S3_NAME
        const FileName = `statistics-daily-v2-${moment().format()}.csv`
        let uploadParams = {
            Bucket: STATISTICS_DAILY_CSV_S3_NAME,
            Key: FileName,
            Body: stream
        }

        const {Location} = await s3.upload(uploadParams).promise()

        // TODO would be good to read back object
        return {FileName, Location}

    }

    const toCSVStream = (data) => stringify(data, {
        header: true,
        // TODO no formatters
    })





    const result =
        R.pipe(
            R.map(getUserValues),
            R.flatten,
            R.map(renameKeys),
            R.map(sortObj)
        )(flattenLevel1Array)



    console.log('First 3 records of the result: ')
    console.log(JSON.stringify(
        R.take(3,result)
    ,null,1))





}
