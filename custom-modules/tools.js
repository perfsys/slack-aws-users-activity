const Tools = function () {
  this.httpsGetRequest = function (url) {
    const https = require('https')
    return new Promise(function (resolve, reject) {
      https.get(url, function (response) {
        let data = ''
        response.on('data', function (slice) { data += slice })
        response.on('end', function () { resolve(JSON.parse(data)) })
        response.on('error', function (err) { reject(err) })
      })
    })
  }
  this.getDateTime = function (now = null) {
    if (now == null) now = new Date()

    let date = [now.getFullYear(), ((now.getMonth() + 1) < 10 ? '0' : '') + (now.getMonth() + 1), (now.getDate() < 10 ? '0' : '') + now.getDate()]
    let time = [(now.getHours() < 10 ? '0' : '') + now.getHours(), (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(), (now.getSeconds() < 10 ? '0' : '') + now.getSeconds()]
    return date.join('-') + ' ' + time.join(':')
  }
}

module.exports = function () { return new Tools() }
