const fetch = require('node-fetch')
const fs = require('fs')

async function fetchAndSave (url, filepath) {
  const res = await fetch(url)
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filepath)
    res.body.pipe(fileStream)
    res.body.on('error', (err) => {
      reject(err)
    })
    fileStream.on('finish', function () {
      resolve()
    })
  })
}

module.exports = fetchAndSave
