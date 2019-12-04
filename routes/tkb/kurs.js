const cheerio = require('cheerio')
const rp = require('request-promise').defaults({
  jar: true,
  rejectUnauthorized: false,
  followAllRedirects: true,
  resolveWithFullResponse: true
})

const KURS = require('../../models/kurs')
const mainUrl = 'https://fiskal.kemenkeu.go.id/dw-kurs-db.asp'

const getAllDate = (tahun1, tahun2) => {
  
  console.log(yNow, mNow)

  for(let t = tahun1; t <= tahun2; t++){
    for(let b of bulan){
    }
  }
}

getAllKurs = $ => {
  const rows = $('table.table tr')
  const data = {}

  for(let r = 1; r < rows.length; r++){
    const key = $(rows[r]).find('td:nth-child(2)').text().split(/\(|\)/g)[1].trim()
    const value = parseFloat($(rows[r]).find('td:nth-child(3)').text().replace(',',''))
    data[key] = value
  }

  return data
}

const getKurs = async (req, res) => {
  let { tahun1, tahun2, now } = req.body

  if(typeof now !== 'undefined'){
    const yNow = new Date().getFullYear().toString()
    const mNow = (new Date().getMonth() + 1).toString().padStart(2, "0")
    const dNow = new Date().getDate().toString().padStart(2, "0")

    const strDate = `${ yNow }${ mNow }${ dNow }`
    const id = `${ mNow }/${ dNow }/${ yNow }`

    const resp = await rp.post(mainUrl, { form: { strDate, id } })
    const $ = cheerio.load(resp.body)

    const data = {
      KMK: $('h3').text().trim(),
      KURS: getAllKurs($),
      TGL_BERLAKU: new Date().getTime()
    }

    await KURS.findOneAndUpdate({ TGL_BERLAKU: data.TGL_BERLAKU }, data, { upsert: true })
    console.log('ok')
    res.json({ ok: true })
  } else {
    tahun1 = parseInt(tahun1)
    tahun2 = parseInt(tahun2)

    const firstDate = new Date(tahun1, 0).getTime()
    const lastDate = tahun2 == new Date().getFullYear()
      ? new Date().getTime()
      : new Date(tahun2, 11, 31).getTime()
    
    for(let date = firstDate; date <= lastDate; date += 86400000){
      const y = new Date(date).getFullYear().toString()
      const m = (new Date(date).getMonth() + 1).toString().padStart(2, "0")
      const d = new Date(date).getDate().toString().padStart(2, "0")

      const strDate = `${ y }${ m }${ d }`
      const id = `${ m }/${ d }/${ y }`

      const resp = await rp.post(mainUrl, { form: { strDate, id } })
      const $ = cheerio.load(resp.body)

      const data = {
        KMK: $('h3').text().trim(),
        KURS: getAllKurs($),
        TGL_BERLAKU: new Date(date).getTime()
      }

      console.log(new Date(data.TGL_BERLAKU))
      await KURS.findOneAndUpdate({ TGL_BERLAKU: data.TGL_BERLAKU }, data, { upsert: true })
    }
    console.log('ok')
    res.json({ ok: true })
  }
}

module.exports = getKurs