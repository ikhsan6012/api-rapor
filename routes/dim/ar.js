const fs = require('fs')
const path = require('path')
const csvjson = require('csvjson')

const DIMAR = require('../../models/dimAr')

const importListAr = async (req, res) => {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'REF', 'LIST_AR.csv')
  const csv = await fs.readFileSync(filePath, 'utf-8')

  const data = await csvjson.toObject(csv, {
    quote: '"',
    delimiter: ','
  })
  
  const insert = []
  for(let d of data){
    d.KD_SEKSI = 0
    insert.push({
      insertOne: {
        document: d
      }
    })
  }

  const resp = await DIMAR.bulkWrite(insert)
  res.json(resp)
}

module.exports = importListAr