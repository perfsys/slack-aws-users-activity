const R = require('ramda')

const isEmptyDay = (day) => {
  // console.log(JSON.stringify(
  //   day
  //   , null, 1))

  // https://github.com/ramda/ramda/wiki/Cookbook#convert-object-to-array
  const convert = R.compose(R.map(R.zipObj(['person', 'data'])), R.toPairs)

  const actualDay = R.pipe(R.keys, R.last)(day)

  return R.pipe(
    // get only info about people. Ignoring day field
    R.prop(actualDay),
    // convert Object of people to an array
    convert,
    // get only data.online values
    R.map((i) => R.path(['data', 'online'], i)),
    // do sum all the online values to see if day in slack empty
    R.sum
  )(day) === 0
}

exports.isEmptyDay = isEmptyDay
