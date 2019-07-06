const https = require('https')

const Utils = function () {
  this.httpsGetRequest = function (url) {

    return new Promise(function (resolve, reject) {
      https.get(url, function (response) {
        let data = ''
        response.on('data', function (slice) { data += slice })
        response.on('end', function () { resolve(JSON.parse(data)) })
        response.on('error', function (err) { reject(err) })
      })
    })
  }
}

module.exports = function () { return new Utils() }
