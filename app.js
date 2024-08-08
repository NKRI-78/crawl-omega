const fs = require("fs")
const path = require("path")
const csv = require("csv-parser")

const express = require('express')

const app = express()

const moment = require("moment")

const mysql = require("mysql2")
const configs = require("./configs")
const misc = require("./helpers/response")
const conn = mysql.createConnection(configs.database.mysql)

const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post("/get-crawl", async (req, res) => {
  misc.response(res, 200, false, "")
})

var date = new Date()

var format = moment(date).format('YYYYMMDD')

const filePath = path.join(__dirname, `../out-school-${format}.csv`)

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = []

    fs.createReadStream(filePath)
      .pipe(csv(['phone', 'website']))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

async function getCsv() {
  try {

    var data = await parseCSV(filePath)

    for (const i in data) {
      var item = data[i]

      var phone = item.phone
      var website = item.website

      var query = `INSERT INTO omega_crawlings (website, no_hp) 
      VALUES ('${website}', '${phone}')`

      conn.query(query, (e, result) => {
        if (e) {
            console.log(e)
        } else {
            console.log(result)
        }
      })
    }

  } catch(e) {
      
    console.log(e)

  }
}

getCsv()