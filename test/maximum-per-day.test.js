const { expect } = require('chai')
const { assert } = require('chai')

const { findMaximumDaily } = require('../libs/maximum-per-day')
const notEmptyDayTestData = require('./data/test_data_not_empty-day.json')

describe('maximum-per-day', function () {
  it('should return day object with `_maximum` user equals to eorlovsky', function () {
    // run
    const data = findMaximumDaily(notEmptyDayTestData)

    // TODO need to test it is actual maximum
    expect(data).to.be.a('object')
  })
})
