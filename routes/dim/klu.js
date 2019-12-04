const fs = require('fs')
const path = require('path')
const csvjson = require('csvjson')

const DIMKATKLU = require('../../models/dimKatKlu')
const DIMGOLPOKOKKLU = require('../../models/dimGolPokokKlu')
const DIMGOLKLU = require('../../models/dimGolKlu')
const DIMSUBGOLKLU = require('../../models/dimSubgolKlu')
const DIMKLU = require('../../models/dimKlu')

const importListKlu = async (req, res) => {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'REF', 'LIST_KLU.csv')
  const csv = await fs.readFileSync(filePath, 'utf-8')

  const data = await csvjson.toObject(csv, {
    quote: '"',
    delimiter: ','
  })

  const data2 = {
    KAT_KLU: [],
    GOL_POKOK_KLU: [],
    GOL_KLU: [],
    SUBGOL_KLU: [],
    KLU: [],
  }

  const toObject = (key, val) => {
    val = val.split('. ')
    data2[key].push({
      updateOne: {
        filter: { [`KD_${ key }`]: val[0] },
        update: {
          [`KD_${ key }`]: val[0],
          [`NAMA_${ key }`]: val[1],
        },
        upsert: true
      }
    })
  }

  for(let d of data){
    const keys = Object.keys(d)
    for(let k of keys){
      toObject(k, d[k])
    }
  }

  const { KAT_KLU, GOL_POKOK_KLU, GOL_KLU, SUBGOL_KLU, KLU } = data2

  await DIMKATKLU.bulkWrite(KAT_KLU)
  await DIMGOLPOKOKKLU.bulkWrite(GOL_POKOK_KLU)
  await DIMGOLKLU.bulkWrite(GOL_KLU)
  await DIMSUBGOLKLU.bulkWrite(SUBGOL_KLU)
  await DIMKLU.bulkWrite(KLU)

  // const resp = await DIMAR.bulkWrite(insert)
  res.json({ ok: true })
}

module.exports = importListKlu