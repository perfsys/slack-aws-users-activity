const { expect } = require('chai')
const { assert } = require('chai')

const { isEmptyDay } = require('../libs/is-empty-day')
const emptyDayTestData = require('./data/test_data_empty-day.json')
const notEmptyDayTestData = require('./data/test_data_not_empty-day.json')

describe('is-empty-day', function () {
  it('should return `true` when all the people have 0 online', function () {
    assert.equal(isEmptyDay(emptyDayTestData), true)
  })

  it('should return `true` when empty object', function () {
    assert.equal(isEmptyDay({

    }), true)
  })

  it('should return `false` when not object', function () {
    assert.equal(isEmptyDay(notEmptyDayTestData), false)
  })
})
