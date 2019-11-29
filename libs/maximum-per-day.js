const R = require('ramda')

const findMaximumDaily = (day) => {
  // console.log(`input object: ${JSON.stringify(day)}`)

  const actualDay = R.pipe(R.keys, R.last)(day)

  // This function return value of `online` or just number if not an Object. This is because used in  R.reduce
  const maxFunction = (i) => R.propOr(i, 'online', i)

  // https://github.com/ramda/ramda/wiki/Cookbook#convert-object-to-array
  const convert = R.compose(R.map(R.zipObj(['person', 'data'])), R.toPairs)

  const result =
  R.pipe(
    // get only info about people. Ignoring day field
    R.prop(actualDay),
    // convert Object of people to an array
    convert,

    // get only data.online values
    R.map((i) => R.path(['data'], i)),

    // Reducing list of object to find object with Maximum `online` value
    R.reduce(R.maxBy(maxFunction), 0)
  )(day)

  // Constructing back day object with _maximumDaily field
  return R.assocPath([actualDay, '_maximumDaily'], result, day)
}

exports.findMaximumDaily = findMaximumDaily
